import { projectId, publicAnonKey } from './supabase/info';
import { createClient } from '@supabase/supabase-js';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e4f342e1`;

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Auth functions
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  return { data, error };
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  return { error };
}

export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  return { data, error };
}

export async function signUpAdmin(email: string, password: string, name: string) {
  const response = await fetch(`${API_BASE}/admin/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name }),
  });
  return await response.json();
}

// Admin code management
export async function getAdminCode(accessToken: string) {
  const response = await fetch(`${API_BASE}/admin/code`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

export async function saveAdminCode(code: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/admin/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ code }),
  });
  return await response.json();
}

export async function signUpAdminWithCode(email: string, password: string, name: string, verificationCode: string) {
  const response = await fetch(`${API_BASE}/admin/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name, verificationCode }),
  });
  return await response.json();
}

export async function createAdminUser(email: string, password: string, name: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/admin/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email, password, name, createdByAdmin: true }),
  });
  return await response.json();
}

// Customer auth
export async function signUpCustomer(email: string, password: string, name: string, phone: string) {
  const response = await fetch(`${API_BASE}/customer/signup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify({ email, password, name, phone }),
  });
  return await response.json();
}

export async function getCustomerOrders(accessToken: string) {
  const response = await fetch(`${API_BASE}/customer/orders`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// Order messaging
export async function addOrderMessage(orderId: string, message: string, type: string, from: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/orders/${orderId}/message`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ message, type, from }),
  });
  return await response.json();
}

// Gallery
export async function getGallery() {
  const response = await fetch(`${API_BASE}/gallery`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  return await response.json();
}

export async function saveGalleryImage(url: string, caption: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/gallery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ url, caption }),
  });
  return await response.json();
}

export async function deleteGalleryImage(id: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/gallery/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// Menu functions
export async function getMenu() {
  const response = await fetch(`${API_BASE}/menu`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  return await response.json();
}

export async function saveMenuItem(item: any, accessToken: string) {
  const response = await fetch(`${API_BASE}/menu`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(item),
  });
  return await response.json();
}

export async function deleteMenuItem(id: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/menu/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// Order functions
export async function placeOrder(orderData: any) {
  const response = await fetch(`${API_BASE}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    },
    body: JSON.stringify(orderData),
  });
  return await response.json();
}

export async function getOrders(accessToken: string) {
  const response = await fetch(`${API_BASE}/orders`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

export async function updateOrderStatus(orderId: string, updates: any, accessToken: string) {
  const response = await fetch(`${API_BASE}/orders/${orderId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(updates),
  });
  return await response.json();
}

// Get order by receipt code (no auth required)
export async function getOrderByReceiptCode(receiptCode: string) {
  const response = await fetch(`${API_BASE}/orders/receipt/${receiptCode}`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  return await response.json();
}

// Branding functions
export async function getBranding() {
  const response = await fetch(`${API_BASE}/branding`, {
    headers: {
      'Authorization': `Bearer ${publicAnonKey}`,
    },
  });
  return await response.json();
}

export async function saveBranding(branding: any, accessToken: string) {
  const response = await fetch(`${API_BASE}/branding`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify(branding),
  });
  return await response.json();
}

// User management functions
export async function createUser(email: string, password: string, name: string, title: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ email, password, name, title }),
  });
  return await response.json();
}

export async function getUsers(accessToken: string) {
  const response = await fetch(`${API_BASE}/users`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

export async function updateUser(userId: string, title: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title }),
  });
  return await response.json();
}

export async function deleteUser(userId: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/users/${userId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

// Customer management functions
export async function getCustomers(accessToken: string) {
  const response = await fetch(`${API_BASE}/customers`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}

export async function getCustomerOrdersById(customerId: string, accessToken: string) {
  const response = await fetch(`${API_BASE}/customers/${customerId}/orders`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  });
  return await response.json();
}