'use strict';
const { createCoreController } = require("@strapi/strapi").factories;
const stripe = require("stripe")(process.env.TOKEN_PRIVADO);
/**
 * order controller
 */

 module.exports = createCoreController("api::order.order", ({ strapi }) => ({
    async create(ctx) {
      const { token, products, idUser, address,total} = ctx.request.body;
      const charge = await stripe.charges.create({
        amount: total * 100,
        currency: "eur",
        source: token.id,
        description: `ID Usuario: ${idUser}`,
      });
  
      const createOrder = [];
  
      for await (const product of products) {
        const data = {
          producto: product.id,
          users_permissions_user: idUser,
          totalPayment : total,
          idPayment: charge.id,
          adressShipping: address,
        };
  
        // Register the order in the database
        const entity = await strapi.service("api::order.order").create({
          data,
        });
  
        const sanitizedEntity = await this.sanitizeOutput(entity, ctx);
  
        createOrder.push(this.transformResponse(sanitizedEntity));
      }
  
      return createOrder;
    },
  }));