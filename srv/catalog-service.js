import cds from "@sap/cds";

export default cds.service.impl(async function () {

    const { Products, Sales } = this.entities;

    this.before("DELETE", Sales, async (req) => {

    const tx = cds.transaction(req);

    const sale = await tx.read(Sales)
        .where({ ID: req.data.ID });

    if (!sale.length) return;

    const product = await tx.read(Products)
        .where({ ID: sale[0].product_ID });

    if (!product.length) return;

    await tx.update(Products)
        .set({
            stock: product[0].stock + sale[0].quantity
        })
        .where({
            ID: sale[0].product_ID
        });

});

    this.after("CREATE", Sales, async (sale, req) => {

        const tx = cds.transaction(req);

        const product = await tx.read(Products)
            .where({ ID: sale.product_ID });

        if (!product.length) return;

        await tx.update(Products)
            .set({
                stock: product[0].stock - sale.quantity
            })
            .where({
                ID: sale.product_ID
            });

    });

});