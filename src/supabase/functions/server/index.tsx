import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors());
app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Initialize storage bucket
async function initializeStorage() {
  const bucketName = 'make-e4f342e1-gallery';
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    if (!bucketExists) {
      await supabase.storage.createBucket(bucketName, {
        public: false,
        fileSizeLimit: 10485760, // 10MB
      });
      console.log('Gallery storage bucket created');
    }
  } catch (error) {
    console.log('Storage initialization error:', error);
  }
}

initializeStorage();

// Admin signup
app.post('/make-server-e4f342e1/admin/signup', async (c) => {
  try {
    const { email, password, name, verificationCode, createdByAdmin } = await c.req.json();

    // If created by existing admin, verify they're logged in
    if (createdByAdmin) {
      const accessToken = c.req.header('Authorization')?.split(' ')[1];
      const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

      if (!user || authError) {
        return c.json({ error: 'Unauthorized - Admin access required to create new admins' }, 401);
      }
    } else {
      // If self-signup, verify the admin code
      const storedCode = await kv.get('admin_verification_code');
      if (!storedCode || storedCode !== verificationCode) {
        return c.json({ error: 'Invalid verification code' }, 400);
      }
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role: 'admin' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('Admin signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Error creating admin user:', error);
    return c.json({ error: 'Failed to create admin user' }, 500);
  }
});

// Get/Set admin verification code
app.get('/make-server-e4f342e1/admin/code', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const code = await kv.get('admin_verification_code');
    return c.json({ code: code || null });
  } catch (error) {
    console.log('Error fetching admin code:', error);
    return c.json({ error: 'Failed to fetch code' }, 500);
  }
});

app.post('/make-server-e4f342e1/admin/code', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { code } = await c.req.json();
    await kv.set('admin_verification_code', code);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving admin code:', error);
    return c.json({ error: 'Failed to save code' }, 500);
  }
});

// Customer signup
app.post('/make-server-e4f342e1/customer/signup', async (c) => {
  try {
    const { email, password, name, phone } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, phone, role: 'customer' },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true,
    });

    if (error) {
      console.log('Customer signup error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ user: data.user });
  } catch (error) {
    console.log('Error creating customer user:', error);
    return c.json({ error: 'Failed to create customer user' }, 500);
  }
});

// Get customer orders
app.get('/make-server-e4f342e1/customer/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Customer login required' }, 401);
    }

    const allOrders = await kv.getByPrefix('order_');
    // Filter orders by customer email
    const customerOrders = (allOrders || []).filter(order => 
      order.email === user.email
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ orders: customerOrders });
  } catch (error) {
    console.log('Error fetching customer orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Add communication to order
app.post('/make-server-e4f342e1/orders/:id/message', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const orderId = c.req.param('id');
    const { message, type, from } = await c.req.json();

    const existingOrder = await kv.get(orderId);
    if (!existingOrder) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const messages = existingOrder.messages || [];
    messages.push({
      message,
      type, // 'notification', 'question', 'change', etc.
      from, // 'admin' or 'customer'
      timestamp: new Date().toISOString(),
    });

    const updatedOrder = {
      ...existingOrder,
      messages,
      updatedAt: new Date().toISOString(),
    };

    await kv.set(orderId, updatedOrder);

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log('Error adding message to order:', error);
    return c.json({ error: 'Failed to add message' }, 500);
  }
});

// Get gallery images
app.get('/make-server-e4f342e1/gallery', async (c) => {
  try {
    const images = await kv.getByPrefix('gallery_');
    return c.json({ images: images || [] });
  } catch (error) {
    console.log('Error fetching gallery:', error);
    return c.json({ error: 'Failed to fetch gallery' }, 500);
  }
});

// Add gallery image (admin only)
app.post('/make-server-e4f342e1/gallery', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { url, caption, type } = await c.req.json();
    const id = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(id, {
      id,
      url,
      caption,
      type: type || 'image',
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, id });
  } catch (error) {
    console.log('Error saving gallery image:', error);
    return c.json({ error: 'Failed to save image' }, 500);
  }
});

// Upload gallery file (admin only)
app.post('/make-server-e4f342e1/gallery/upload', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    const caption = formData.get('caption') as string;
    const type = formData.get('type') as string;

    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }

    // Validate file type
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      return c.json({ error: 'Invalid file type. Only images and videos are allowed.' }, 400);
    }

    // Validate file size (10MB limit)
    if (file.size > 10485760) {
      return c.json({ error: 'File size must be less than 10MB' }, 400);
    }

    const bucketName = 'make-e4f342e1-gallery';
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(fileName, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (uploadError) {
      console.log('File upload error:', uploadError);
      return c.json({ error: 'Failed to upload file' }, 500);
    }

    // Create a signed URL that expires in 10 years (long-lived)
    const { data: signedUrlData } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(fileName, 315360000); // 10 years in seconds

    if (!signedUrlData) {
      return c.json({ error: 'Failed to create signed URL' }, 500);
    }

    const id = `gallery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(id, {
      id,
      url: signedUrlData.signedUrl,
      caption: caption || '',
      type: type || (isImage ? 'image' : 'video'),
      fileName: fileName,
      bucketName: bucketName,
      createdAt: new Date().toISOString(),
    });

    return c.json({ success: true, id, url: signedUrlData.signedUrl });
  } catch (error) {
    console.log('Error uploading gallery file:', error);
    return c.json({ error: 'Failed to upload file' }, 500);
  }
});

// Delete gallery image (admin only)
app.delete('/make-server-e4f342e1/gallery/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(id);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting gallery image:', error);
    return c.json({ error: 'Failed to delete image' }, 500);
  }
});

// Get menu items
app.get('/make-server-e4f342e1/menu', async (c) => {
  try {
    const items = await kv.getByPrefix('menu_');
    return c.json({ items: items || [] });
  } catch (error) {
    console.log('Error fetching menu items:', error);
    return c.json({ error: 'Failed to fetch menu' }, 500);
  }
});

// Add/Update menu item (admin only)
app.post('/make-server-e4f342e1/menu', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const menuItem = await c.req.json();
    const id = menuItem.id || `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    await kv.set(id, {
      ...menuItem,
      id,
      updatedAt: new Date().toISOString(),
    });

    return c.json({ success: true, id });
  } catch (error) {
    console.log('Error saving menu item:', error);
    return c.json({ error: 'Failed to save menu item' }, 500);
  }
});

// Delete menu item (admin only)
app.delete('/make-server-e4f342e1/menu/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const id = c.req.param('id');
    await kv.del(id);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting menu item:', error);
    return c.json({ error: 'Failed to delete menu item' }, 500);
  }
});

// Place order
app.post('/make-server-e4f342e1/orders', async (c) => {
  try {
    const orderData = await c.req.json();
    
    // Generate unique 5-digit receipt code
    const generateReceiptCode = async () => {
      let code = '';
      let isUnique = false;
      
      while (!isUnique) {
        // Generate 5-digit code
        code = Math.floor(10000 + Math.random() * 90000).toString();
        
        // Check if code already exists
        const existingOrders = await kv.getByPrefix('receipt_');
        const codeExists = existingOrders?.some((order: any) => order.receiptCode === code);
        
        if (!codeExists) {
          isUnique = true;
        }
      }
      
      return code;
    };
    
    const receiptCode = await generateReceiptCode();
    
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const order = {
      ...orderData,
      id: orderId,
      receiptCode,
      status: 'pending', // pending, confirmed, preparing, ready, completed, cancelled
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedReadyTime: null, // Set by admin when confirming order
    };

    // Store by both orderId and receiptCode for easy lookup
    await kv.set(orderId, order);
    await kv.set(`receipt_${receiptCode}`, order);

    // Send email receipt if email was provided
    if (orderData.email) {
      try {
        const resendApiKey = Deno.env.get('RESEND_API_KEY');
        
        if (resendApiKey) {
          // Format order items for email
          const itemsList = orderData.items.map((item: any) => 
            `${item.name} x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
          ).join('\n');
          
          // Format pickup date/time
          const pickupDateTime = orderData.pickupDate && orderData.pickupTime 
            ? `${new Date(orderData.pickupDate).toLocaleDateString()} at ${orderData.pickupTime}`
            : 'To be confirmed';
          
          // Create HTML email
          const htmlContent = `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background-color: #0f766e; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
                  .content { background-color: #f9f9f9; padding: 30px; border: 1px solid #ddd; }
                  .receipt-code { background-color: #0f766e; color: white; font-size: 36px; font-weight: bold; text-align: center; padding: 20px; margin: 20px 0; border-radius: 8px; letter-spacing: 8px; }
                  .order-details { background-color: white; padding: 20px; margin: 20px 0; border-radius: 8px; border: 1px solid #ddd; }
                  .item { padding: 8px 0; border-bottom: 1px solid #eee; }
                  .total { font-size: 20px; font-weight: bold; color: #0f766e; margin-top: 15px; padding-top: 15px; border-top: 2px solid #0f766e; }
                  .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
                  .highlight { background-color: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0; border-radius: 4px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>Order Confirmation</h1>
                    <p>Thank you for your order!</p>
                  </div>
                  
                  <div class="content">
                    <h2 style="color: #0f766e; margin-top: 0;">Your Order Receipt</h2>
                    
                    <p>Hi ${orderData.customerName},</p>
                    <p>Your order has been received! Here's your receipt code to track your order:</p>
                    
                    <div class="receipt-code">${receiptCode}</div>
                    
                    <div class="highlight">
                      <strong>Important:</strong> Save this 5-digit code! You'll need it to track your order status in our Customer Portal.
                    </div>
                    
                    <div class="order-details">
                      <h3 style="color: #0f766e; margin-top: 0;">Order Details</h3>
                      <p><strong>Order ID:</strong> ${orderId}</p>
                      <p><strong>Phone:</strong> ${orderData.phone}</p>
                      <p><strong>Pickup Time:</strong> ${pickupDateTime}</p>
                      ${orderData.isCatering ? '<p><strong>Catering Order:</strong> Yes</p>' : ''}
                      ${orderData.specialRequests ? `<p><strong>Special Requests:</strong> ${orderData.specialRequests}</p>` : ''}
                      
                      <h4 style="margin-top: 20px;">Items Ordered:</h4>
                      ${orderData.items.map((item: any) => `
                        <div class="item">
                          <strong>${item.name}</strong> x${item.quantity} - $${(item.price * item.quantity).toFixed(2)}
                        </div>
                      `).join('')}
                      
                      <div class="total">
                        Total: $${orderData.total.toFixed(2)}
                      </div>
                      
                      <p style="margin-top: 20px;"><strong>Payment Method:</strong> ${orderData.paymentMethod.charAt(0).toUpperCase() + orderData.paymentMethod.slice(1)}</p>
                    </div>
                    
                    <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                      <p style="margin: 0;"><strong>Next Steps:</strong></p>
                      <ol style="margin: 10px 0;">
                        <li>Complete payment via ${orderData.paymentMethod === 'cash' ? 'cash on pickup' : orderData.paymentMethod}</li>
                        <li>Use your 5-digit code (<strong>${receiptCode}</strong>) in our Customer Portal to track your order</li>
                        <li>Pick up your order at the scheduled time</li>
                      </ol>
                    </div>
                    
                    <p>We'll notify you once your order is confirmed and ready for pickup!</p>
                  </div>
                  
                  <div class="footer">
                    <p>Thank you for choosing us!</p>
                    <p style="font-size: 12px; color: #999;">This is an automated receipt. Please do not reply to this email.</p>
                  </div>
                </div>
              </body>
            </html>
          `;
          
          // Send email via Resend
          const emailResponse = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: 'orders@resend.dev', // You can customize this later with your domain
              to: orderData.email,
              subject: `Order Confirmation - Receipt Code: ${receiptCode}`,
              html: htmlContent,
            }),
          });
          
          const emailResult = await emailResponse.json();
          
          if (!emailResponse.ok) {
            console.log('Error sending email receipt:', emailResult);
          } else {
            console.log('Email receipt sent successfully to:', orderData.email);
          }
        }
      } catch (emailError) {
        console.log('Error sending email receipt:', emailError);
        // Don't fail the order if email fails - order is still created
      }
    }

    return c.json({ success: true, orderId, receiptCode, order });
  } catch (error) {
    console.log('Error creating order:', error);
    return c.json({ error: 'Failed to create order' }, 500);
  }
});

// Get all orders (admin only)
app.get('/make-server-e4f342e1/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const orders = await kv.getByPrefix('order_');
    // Sort by createdAt descending (newest first)
    const sortedOrders = (orders || []).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ orders: sortedOrders });
  } catch (error) {
    console.log('Error fetching orders:', error);
    return c.json({ error: 'Failed to fetch orders' }, 500);
  }
});

// Get order by receipt code (no auth required - customer access)
app.get('/make-server-e4f342e1/orders/receipt/:code', async (c) => {
  try {
    const receiptCode = c.req.param('code');
    const order = await kv.get(`receipt_${receiptCode}`);
    
    if (!order) {
      return c.json({ error: 'Order not found. Please check your receipt code.' }, 404);
    }

    return c.json({ order });
  } catch (error) {
    console.log('Error fetching order by receipt code:', error);
    return c.json({ error: 'Failed to fetch order' }, 500);
  }
});

// Update order status (admin only)
app.patch('/make-server-e4f342e1/orders/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const orderId = c.req.param('id');
    const updates = await c.req.json();

    const existingOrder = await kv.get(orderId);
    if (!existingOrder) {
      return c.json({ error: 'Order not found' }, 404);
    }

    const updatedOrder = {
      ...existingOrder,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Update both the order ID and receipt code entries
    await kv.set(orderId, updatedOrder);
    if (existingOrder.receiptCode) {
      await kv.set(`receipt_${existingOrder.receiptCode}`, updatedOrder);
    }

    // Send SMS notification when order is ready
    if (updates.status === 'ready' && existingOrder.phone) {
      try {
        const twilioAccountSid = Deno.env.get('TWILIO_ACCOUNT_SID');
        const twilioAuthToken = Deno.env.get('TWILIO_AUTH_TOKEN');
        const twilioPhoneNumber = Deno.env.get('TWILIO_PHONE_NUMBER');
        
        if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
          const branding = await kv.get('branding_settings') || {};
          const businessName = branding.businessName || 'Restaurant';
          
          const smsMessage = `${businessName}: Your order is ready for pickup! Your receipt code is ${existingOrder.receiptCode}. Thank you!`;
          
          // Format phone number for Twilio (ensure it starts with +1 for US numbers)
          let formattedPhone = existingOrder.phone.replace(/\D/g, '');
          if (formattedPhone.length === 10) {
            formattedPhone = '+1' + formattedPhone;
          } else if (!formattedPhone.startsWith('+')) {
            formattedPhone = '+' + formattedPhone;
          }
          
          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const credentials = btoa(`${twilioAccountSid}:${twilioAuthToken}`);
          
          const twilioResponse = await fetch(twilioUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Basic ${credentials}`,
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
              To: formattedPhone,
              From: twilioPhoneNumber,
              Body: smsMessage,
            }),
          });
          
          if (twilioResponse.ok) {
            console.log(`SMS sent successfully to ${formattedPhone} for order ${orderId}`);
          } else {
            const errorText = await twilioResponse.text();
            console.log(`Failed to send SMS: ${errorText}`);
          }
        } else {
          console.log('Twilio credentials not configured, skipping SMS notification');
        }
      } catch (smsError) {
        console.log('Error sending SMS notification:', smsError);
        // Don't fail the order update if SMS fails
      }
    }

    return c.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.log('Error updating order:', error);
    return c.json({ error: 'Failed to update order' }, 500);
  }
});

// Get branding
app.get('/make-server-e4f342e1/branding', async (c) => {
  try {
    const branding = await kv.get('branding_settings');
    return c.json({ branding: branding || {} });
  } catch (error) {
    console.log('Error fetching branding:', error);
    return c.json({ error: 'Failed to fetch branding' }, 500);
  }
});

// Update branding (admin only)
app.post('/make-server-e4f342e1/branding', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const branding = await c.req.json();
    await kv.set('branding_settings', branding);

    return c.json({ success: true });
  } catch (error) {
    console.log('Error saving branding:', error);
    return c.json({ error: 'Failed to save branding' }, 500);
  }
});

// Create user (admin only)
app.post('/make-server-e4f342e1/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user: admin }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!admin || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const { email, password, name, title } = await c.req.json();

    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name, 
        role: 'user',
        title: title || 'Staff',
        createdBy: admin.id,
      },
      email_confirm: true,
    });

    if (error) {
      console.log('User creation error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error creating user:', error);
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get all users (admin only)
app.get('/make-server-e4f342e1/users', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    // Get all users from auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error listing users:', error);
      return c.json({ error: 'Failed to list users' }, 500);
    }

    // Filter to only return admins and staff users (not customers)
    const staffUsers = users.filter(u => 
      u.user_metadata?.role === 'admin' || u.user_metadata?.role === 'user'
    );

    return c.json({ users: staffUsers });
  } catch (error) {
    console.log('Error fetching users:', error);
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Update user (admin only)
app.patch('/make-server-e4f342e1/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user: admin }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!admin || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const userId = c.req.param('id');
    const { title } = await c.req.json();

    // Get the current user to preserve other metadata
    const { data: { user: targetUser }, error: getUserError } = await supabase.auth.admin.getUserById(userId);
    
    if (getUserError || !targetUser) {
      return c.json({ error: 'User not found' }, 404);
    }

    const { data, error } = await supabase.auth.admin.updateUserById(userId, {
      user_metadata: {
        ...targetUser.user_metadata,
        title,
      },
    });

    if (error) {
      console.log('User update error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true, user: data.user });
  } catch (error) {
    console.log('Error updating user:', error);
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// Delete user (admin only)
app.delete('/make-server-e4f342e1/users/:id', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user: admin }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!admin || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const userId = c.req.param('id');

    const { error } = await supabase.auth.admin.deleteUser(userId);

    if (error) {
      console.log('User deletion error:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ success: true });
  } catch (error) {
    console.log('Error deleting user:', error);
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

// Get all customers (admin only)
app.get('/make-server-e4f342e1/customers', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    // Get all users from auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Error listing customers:', error);
      return c.json({ error: 'Failed to list customers' }, 500);
    }

    // Filter to only return customers
    const customers = users.filter(u => 
      u.user_metadata?.role === 'customer'
    );

    return c.json({ customers });
  } catch (error) {
    console.log('Error fetching customers:', error);
    return c.json({ error: 'Failed to fetch customers' }, 500);
  }
});

// Get customer orders by customer ID (admin only)
app.get('/make-server-e4f342e1/customers/:customerId/orders', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken);

    if (!user || authError) {
      return c.json({ error: 'Unauthorized - Admin access required' }, 401);
    }

    const customerId = c.req.param('customerId');
    
    // Get customer info
    const { data: { user: customer }, error: customerError } = await supabase.auth.admin.getUserById(customerId);
    
    if (customerError || !customer) {
      return c.json({ error: 'Customer not found' }, 404);
    }

    const allOrders = await kv.getByPrefix('order_');
    // Filter orders by customer email
    const customerOrders = (allOrders || []).filter(order => 
      order.email === customer.email
    ).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ orders: customerOrders });
  } catch (error) {
    console.log('Error fetching customer orders:', error);
    return c.json({ error: 'Failed to fetch customer orders' }, 500);
  }
});

Deno.serve(app.fetch);