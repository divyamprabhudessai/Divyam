# Divyam - Trymighty Frontend Developer Challenge

A modern order management system built with SvelteKit for the Trymighty Frontend Developer Challenge. This application allows users to view and cancel purchases with a sleek interface.

![Divyam Logo](https://img.hotimg.com/allmighty_logo-removebg-preview.png)

🔗 **Live Demo**: [Divyam - Order Management System](https://divyam-order-management-system.vercel.app/)

🔗 **Demo-Video**: [Video](https://streamable.com/kfq0nd)

## 🎯 Challenge Overview

This project implements a web application for viewing and canceling purchases, meeting the following requirements:

1. Phone number-based authentication system
2. OTP verification flow
3. Order listing and management
4. Order details viewing
5. Order cancellation functionality

## 🌟 Features

### Authentication Flow
- Country code and mobile number input
- OTP request and validation
- Secure sign-in process

### Order Management
- View today's orders
- Detailed order information display
- Order items listing
- Order cancellation functionality
- Real-time status updates

### User Interface
- Glass-morphism effects
- Responsive layout
- Smooth animations
- Intuitive navigation

## 🚀 Tech Stack

- **Frontend Framework**: SvelteKit
- **Styling**: TailwindCSS
- **State Management**: Svelte Stores
- **API Integration**: Trymighty REST API
- **Authentication**: JWT-based system
- **Animations**: CSS Transitions & Keyframes

## 📱 Application Flow

1. **Authentication**
   - Enter country code and mobile number
   - Request OTP from server
   - Validate received OTP
   - Complete sign-in process

2. **Orders List**
   - View today's orders
   - Display order status and details
   - Navigate to order details

3. **Order Details**
   - View comprehensive order information
   - List order items
   - Cancel order functionality
   - Return to orders list

## 🔌 API Integration

The application integrates with the following Trymighty API endpoints:

### Authentication
- Request OTP: `POST /v2/collaborators?action=request-otp`
- Validate OTP: `POST /v2/collaborators?action=validate-otp`
- Sign In: `POST /v2/collaborators?action=sign-in`

### Orders
- List Today's Orders: `GET /v2/orders?onlyOrders=TRUE&period=TODAY`
- Order Items: `GET /v2/orders/${order.id}/items`
- Cancel Order: `GET /v2/orders/${order.id}`

## 🛠️ Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/divyam.git
cd divyam
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## 🔒 Security Features

- JWT-based authentication
- Secure OTP verification
- Protected API endpoints
- Session management
- Secure storage handling

## 🎨 Design System

- **Theme**: Dark mode with glass-morphism effects
- **Typography**: Inter font family
- **Components**: Custom-styled buttons, inputs, and cards
- **Animations**: Smooth transitions and hover effects

## 📝 Notes

- The application uses the Trymighty test API endpoints
- Test phone number can be used for development
- All API responses are properly handled with error states
- Responsive design works on all device sizes

## 👤 Author

**Divyam**
- GitHub: [@divyamprabhudessai](https://github.com/divyamprabhudessai)
- LinkedIn: [Divyam Prabhu Dessai](https://www.linkedin.com/in/divyam-prabhu-desai-978789202/)


Made with ❤️ by Divyam
