# NeelState Client

This is the frontend client for the NeelState real estate application.

## Features

- User authentication with Firebase
- Property listings with image uploads
- Search and filter functionality
- Interactive maps with Mapbox integration
- **Stripe payment integration for property purchases**
- **Purchase and sales management**
- **Refund processing for sellers**
- Responsive design with Tailwind CSS

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file in the client directory with the following variables:

```env
# Firebase configuration (already configured)
# Add your Mapbox access token for map functionality
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here

# Add your Stripe publishable key for payment processing
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here
```

3. Get required API keys:
- **Mapbox**: Go to [Mapbox](https://account.mapbox.com/access-tokens/) to get an access token
- **Stripe**: Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys) to get your publishable key

4. Run the development server:
```bash
npm run dev
```

## Stripe Setup

### Getting Your Stripe Keys:
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
2. Sign up or log in to your Stripe account
3. Navigate to "Developers" → "API keys"
4. Copy your "Publishable key" (starts with `pk_test_` for test mode or `pk_live_` for live mode)
5. Add it to your `.env` file as `VITE_STRIPE_PUBLISHABLE_KEY`

### Test Mode vs Live Mode:
- **Test Mode**: Use `pk_test_` keys for development and testing
- **Live Mode**: Use `pk_live_` keys for production (only after thorough testing)

### Test Card Numbers:
For testing payments, you can use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **Expiry**: Any future date
- **CVC**: Any 3 digits

## Mapbox Integration

The application now includes Mapbox integration for displaying property locations on interactive maps. To use this feature:

1. Add your Mapbox access token to the `.env` file
2. When creating or updating listings, you can now add latitude and longitude coordinates
3. The listing detail page will display an interactive map showing the property location

## Stripe Payment Integration

The application includes full Stripe payment processing for property purchases:

### Features:
- **Secure Payment Processing**: All payments are processed securely through Stripe
- **Property Purchases**: Users can purchase properties directly through the platform
- **Purchase History**: Users can view all their purchased properties
- **Sales Management**: Sellers can view all their sold properties and buyer information
- **Refund Processing**: Sellers can process refunds for completed sales
- **Automatic Listing Removal**: Sold properties are automatically removed from the main listings page

### Setup:
1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your publishable key from the Stripe Dashboard
3. Add the key to your `.env` file as `VITE_STRIPE_PUBLISHABLE_KEY`
4. Set up your Stripe secret key in the backend API

### How it works:
1. **Buying a Property**: Users can click "Buy Now" on any available property
2. **Payment Form**: A secure Stripe payment form appears for card details
3. **Purchase Completion**: Upon successful payment, the property is marked as sold
4. **Access**: Buyers can access their purchased properties from "My Purchases"
5. **Seller Management**: Sellers can view sales and process refunds from "My Sales"

## Troubleshooting

### Common Issues:

1. **"Stripe is not defined" or payment form not loading**:
   - Make sure `VITE_STRIPE_PUBLISHABLE_KEY` is set in your `.env` file
   - Check that the key starts with `pk_test_` or `pk_live_`
   - Restart the development server after adding the environment variable

2. **"Payment service is currently unavailable"**:
   - Verify your Stripe publishable key is correct
   - Check that the backend API is running with proper Stripe configuration
   - Ensure both frontend and backend have matching test/live mode keys

3. **Map not displaying**:
   - Verify your `VITE_MAPBOX_ACCESS_TOKEN` is set correctly
   - Check that the coordinates are provided for the listing
   - Ensure your Mapbox account has sufficient quota

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
