import express from "express";
import { InitiateCheckoutController } from "../app/controllers/checkout/initiate.checkout.js";
import { InitiatePaymentRequestService } from "../core/services/checkout/initiate.checkout.service.js";
import { SequelizeTransactionRepository } from "../data/interfaces/sequilize.transaction.respository.js";
import { SequilizeCartRepository } from "../data/interfaces/sequilize.cart.repository.js";
import { SequelizeInventoryRepository } from "../infrastructure/repositories/inventoryRepository.js";
import { InventoryService } from "../core/services/inventory/inventory.service.js";
import { FetchPaymentRequestController } from "../app/controllers/checkout/fetch.payment.js";
import { FetchPaymentRequestService } from "../core/services/checkout/get.payment.service.js";
import { FetchCartController } from "../app/controllers/cart/fetch.cart.js";
import { FetchCartService } from "../core/services/cart/fetch.cart.service.js";
import { CreateOrderController } from "../app/controllers/orders/create.order.js";
import { CreateOrderService } from "../core/services/order/create.order.service.js";
import { SequilizeOrderRepository } from "../data/interfaces/sequilize.order.repository.js";
import { CheckoutCallbackController } from "../app/controllers/checkout/checkout.callback.js";
import { UpdatePaymentRequestService } from "../core/services/checkout/update.payment.service.js";
import { validateUserToken } from "../app/middleware/validate.token.js";
import { DeleteCartController } from "../app/controllers/cart/delete.cart.js";
import { DeleteCartService } from "../core/services/cart/delete.cart.service.js";
import { models, sequelize } from "../data/integrations/database/models/index.js";
import { paymentProviderFactory } from "../infrastructure/payments/paymentProviderFactory.js";
import { SequelizeIdempotencyRepository } from "../infrastructure/repositories/idempotencyRepository.js";

const { Transaction, Cart, CartItem, Order, ProductVariant, StockMovement, IdempotencyCache } = models;

// Repositories
const transactionRepository = new SequelizeTransactionRepository(Transaction);
const cartRepository = new SequilizeCartRepository(Cart, CartItem);
const orderRepository = new SequilizeOrderRepository(Order);
const idempotencyRepository = new SequelizeIdempotencyRepository(IdempotencyCache);
const inventoryRepository = new SequelizeInventoryRepository(sequelize, ProductVariant, StockMovement);
const inventoryService = new InventoryService(inventoryRepository);

// Services
const iniatePaymentRequestService = new InitiatePaymentRequestService(cartRepository, transactionRepository, paymentProviderFactory, idempotencyRepository, inventoryService);
const fetchPaymentReuestService = new FetchPaymentRequestService(transactionRepository);
const fetchCartService = new FetchCartService(cartRepository);
const createOrderService = new CreateOrderService(orderRepository);
const updatePaymentRequestService = new UpdatePaymentRequestService(transactionRepository, inventoryService);
const deleteCartService = new DeleteCartService(cartRepository);

// Controllers and Middleware
const iniateCheckoutRequest = new InitiateCheckoutController(iniatePaymentRequestService);
const fetchPaymentRequest = new FetchPaymentRequestController(fetchPaymentReuestService);
const fetchCartController = new FetchCartController(fetchCartService);
const createOrder = new CreateOrderController(createOrderService);
const checkoutCallback = new CheckoutCallbackController(updatePaymentRequestService);
const deleteCartController = new DeleteCartController(deleteCartService);


// Routes
const checkoutRoutes = express.Router({ mergeParams: true, caseSensitive: true });

checkoutRoutes.post('/', validateUserToken, iniateCheckoutRequest.initiateCheckout);
checkoutRoutes.post('/callback', checkoutCallback.checkoutCallback);

export { checkoutRoutes };
