# Development Notes

## Email & SMS Integration Status

### Resend (Email) ✅
- **Status**: Connected and ready
- **API Key**: Already provided via `RESEND_API_KEY`
- **Template**: Built-in HTML email template (includes order details + 5-digit code)
- **Setup Needed**: 
  - Connect a domain to Resend to send emails from your domain
  - Without domain: emails may go to spam or fail
  - Docs: https://resend.com/docs/dashboard/domains/introduction

### Twilio (SMS) ⚠️
- **Status**: Code implemented, awaiting credentials
- **Cost**: Expensive for small projects
- **Credentials Needed**: 
  - `TWILIO_ACCOUNT_SID`
  - `TWILIO_AUTH_TOKEN`
  - `TWILIO_PHONE_NUMBER`
- **Alternative**: Consider cheaper SMS providers like:
  - MessageBird
  - Vonage/Nexmo
  - Telnyx
  - AWS SNS

### Next Steps for Alternative Services
If you want to use a different email or SMS service:
1. Tell me which service you want to use
2. I'll integrate it into the code
3. You'll get prompts to add your API keys
4. No manual code changes needed!

### Deployment Notes
- Consider using Vercel for deployment
- All services work through Figma Make's environment variable system
- UI is complete and functional
- Backend architecture is ready for any provider
