const express = require('express');
const escpos = require('escpos');

const cors = require('cors')
const axios = require("axios");
const sharp = require("sharp");
const path = require("path");
escpos.USB = require('escpos-usb');
const app = express();
app.use(express.json());

app.use(cors());

app.post('/print-receipt', async (req, res) => {
    const {
        company,
        imagePath,
        sale_no,
        customer,
        served_by,
        date,
        items,
        total,
        discount,
        tax,
        payment_method,
        pin
    } = req.body;
    console.log(req.body)
    try {
        const device = new escpos.USB();
        const printer = new escpos.Printer(device);

        device.open(async () => {
            try {
                if (company.name) {
                    const image = await loadImage(company.name);
                    printer.image(image);
                }
                printer.align('ct')
                    .size(1, 1).text(company.name);

                printer.encode('GB18030').align('ct').size(0, 0).text(company.email.toUpperCase());

                printer.encode('GB18030').align('ct').size(0, 0).text(`TEL:${company.phone}`);
                printer.encode('GB18030').align('ct')
                    .size(1, 0).text('SALE RECEIPT');
                printer.encode('GB18030').align('ct').size(0, 0).text(`(COPY)`);
                printer.encode('GB18030').align('lt').text("\n");
                printer.encode('GB18030').size(0, 0).text(`Sale No   : ${sale_no}`);
                printer.encode('GB18030').size(0, 0).text(`Served by :${served_by}`);
                printer.encode('GB18030').size(0, 0).text(`Customer  :${customer}`);
                printer.encode('GB18030').size(0, 0).text(`Date      :${date}`);
                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);
                printer.encode('GB18030').tableCustom(
                    [
                        {text: "Item", align: "LEFT", width: 0.6,style:'B'},
                        {text: "Tax", align: "CENTER", width: 0.2,style:'B'},
                        {text: "Total", align: "RIGHT", width: 0.2,style:'B'}
                    ]
                );

                for (let i = 0; i < items.length; i++) {
                    let item = items[i];
                    printer.encode('GB18030').tableCustom(
                        [
                            {text: `${item.sku}(${item.name})`, align: "LEFT", width: 0.6},
                            {text: "", align: "CENTER", width: 0.2},
                            {text: "", align: "RIGHT", width: 0.2}
                        ] // Optional
                    );
                    printer.encode('GB18030').tableCustom(
                        [
                            {
                                text: `${item.quantity} ${item.unit_of_quantity} x ${item.unit_price}`,
                                align: "LEFT",
                                width: 0.6
                            },
                            {text: `${item.tax}`, align: "CENTER", width: 0.2},
                            {text: `${item.price}`, align: "RIGHT", width: 0.2}
                        ]
                    );
                    printer.encode('GB18030').align('lt').text("");

                }
                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);
                printer.encode('GB18030').tableCustom(
                    [
                        {text: "SUBTOTAL", align: "LEFT", width: 0.5},
                        {text: `${total}`, align: "RIGHT", width: 0.5}
                    ]
                );
                printer.encode('GB18030').tableCustom(
                    [
                        {text: "DISCOUNT", align: "LEFT", width: 0.5},
                        {text: `${discount ?? 0}`, align: "RIGHT", width: 0.5,}
                    ]
                );

                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);

                printer.encode('GB18030').tableCustom(
                    [
                        {text: "Code", align: "LEFT", width: 0.25,style:'B'},
                        {text: "Rate", align: "LEFT", width: 0.25,style:'B'},
                        {text: "Taxable", align: "LEFT", width: 0.25,style:'B'},
                        {text: "Tax Amount", align: "LEFT", width: 0.25,style:'B'},
                    ]
                );

                printer.encode('GB18030').tableCustom(
                    [
                        {text: "VAT", align: "LEFT", width: 0.25},
                        {text: "16", align: "LEFT", width: 0.25},
                        {text: `${total-tax ?? 0}`, align: "LEFT", width: 0.25},
                        {text: `${tax ?? 0}`, align: "LEFT", width: 0.25},
                    ] // Optional
                );

                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);

                printer.encode('GB18030').tableCustom(
                    [
                        {text: "TOTAL(KES)", align: "LEFT", width: 0.5},
                        {text: `${total}`, align: "RIGHT", width: 0.5}
                    ]
                );

                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);
                printer.encode('GB18030').tableCustom(
                    [
                        {text: "PAYMENT METHOD", align: "LEFT", width: 0.5},
                        {text: `${payment_method}`, align: "RIGHT", width: 0.5}
                    ]
                );

                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);
                printer.encode('GB18030').tableCustom(
                    [
                        {text: "PIN", align: "LEFT", width: 0.5},
                        {text: `${pin}`, align: "RIGHT", width: 0.5}
                    ]
                );
                printer.encode('GB18030').align('ct').size(0, 0).text(`------------------------------------------------`);

                printer.encode('GB18030').text("Powered by PEAKUNIFY");
                printer.encode('GB18030').text("For enquiries : +254710218271");
                printer.encode('GB18030').align('ct').size(0, 0).text(`\n`);
                printer.encode('GB18030').align('ct').size(0, 0).text(`\n`).cut().close();
                res.status(200).send({
                    msg: 'Print job completed'
                });
            } catch (error) {
                console.log('Error printing:', error);
                res.status(500).send({
                    msg: 'Print job failed'
                });
            }
        });
    } catch (e) {
        console.log(e)
        res.status(500).send({
            msg: 'Print job failed'
        });
    }
});

 function loadImage(company_name) {
    const path = require('path');
     const isPkg = typeof process.pkg !== 'undefined';

     const imagePath = isPkg
         ? path.join(process.execPath, 'assets', `${company_name}.png`) // Path inside pkg binary
         : path.join(__dirname, 'assets', `${company_name}.png`);
     console.log(imagePath)
    return new Promise((resolve, reject) => {
        escpos.Image.load(imagePath, image => resolve(image));
    });
}

app.listen(8100, () => {
    console.log('Print service running on port 8100');
});
