import express from "express";
import { sequelize, models } from "../data/integrations/database/models/index.js";
import { SequilizeCartRepository } from "../data/interfaces/sequilize.cart.repository.js";
import { SequelizeInventoryRepository } from "../infrastructure/repositories/inventoryRepository.js";
import { InventoryService } from "../core/services/inventory/inventory.service.js";
import { CreateCartController } from "../app/controllers/cart/create.cart.js";
import { CreateCartService } from "../core/services/cart/create.cart.service.js";
import { FetchCartController } from "../app/controllers/cart/fetch.cart.js";
import { FetchCartService } from "../core/services/cart/fetch.cart.service.js";
import { UpdateCartController } from "../app/controllers/cart/update.cart.js";
import { UpdateCartService } from "../core/services/cart/update.cart.service.js";
import { DeleteCartController } from "../app/controllers/cart/delete.cart.js";
import { DeleteCartService } from "../core/services/cart/delete.cart.service.js";
import { validateUserToken } from "../app/middleware/validate.token.js";

const { Cart, CartItem, ProductVariant, StockMovement } = models;

const cartRoutes = express.Router();

// Repositories
const cartRepository = new SequilizeCartRepository(Cart, CartItem);
const inventoryRepository = new SequelizeInventoryRepository(sequelize, ProductVariant, StockMovement);
const inventoryService = new InventoryService(inventoryRepository);

// CREATE CART ITEM
const createCartService = new CreateCartService(cartRepository, inventoryService);
const createCartController = new CreateCartController(createCartService);

// FETCH CART ITEM
const fetchCartService = new FetchCartService(cartRepository);
const fetchCartController = new FetchCartController(fetchCartService);

// UPDATE CART ITEM
const updateCartService = new UpdateCartService(cartRepository);
const updateCartController = new UpdateCartController(updateCartService);

// DELETE CART ITEM
const deleteCartService = new DeleteCartService(cartRepository);
const deleteCartController = new DeleteCartController(deleteCartService);


// ROUTES   --------------------------------
cartRoutes.get('/', validateUserToken, fetchCartController.fetchCart);
cartRoutes.post('/', validateUserToken, createCartController.createCart);
cartRoutes.patch('/:cartItemId', validateUserToken, updateCartController.updateCart);
cartRoutes.delete('/:cartItemId', validateUserToken, deleteCartController.deleteCart);


export { cartRoutes };
