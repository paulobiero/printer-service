const express = require('express');
const escpos = require('escpos');

const cors = require('cors')
escpos.USB = require('escpos-usb');
const app = express();
app.use(express.json());

app.use(cors());

app.post('/print-receipt', async (req, res) => {
    const {company, imagePath, sale_no, customer, served_by, date,items,total,discount,tax,payment_method,pin} = req.body;
    console.log(req.body)
   try {
       const device = new escpos.USB();
       const printer = new escpos.Printer(device);
       device.open(async () => {
           try {
               if (imagePath) {
                   const image = await loadImage(imagePath);
                   printer.image(image);
               }
               printer.text("\n");
               printer.align('ct').style('bold')
                   .size(1, 1).text(company.name);

               printer.align('ct').style('normal').size(0, 0).text(company.email.toUpperCase());

               printer.align('ct').style('normal').size(0, 0).text(`TEL:${company.phone}`);
               printer.align('ct').style('bold')
                   .size(1, 0).text('SALE RECEIPT');
               printer.align('ct').style('normal').size(0, 0).text(`(COPY)`);
               printer.align('lt').text("\n");
               printer.style('bold').size(0, 0).text(`Sale No   : ${sale_no}`);
               printer.style('bold').size(0, 0).text(`Served by :${served_by}`);
               printer.style('bold').size(0, 0).text(`Customer  :${customer}`);
               printer.style('bold').size(0, 0).text(`Date      :${date}`);
               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);
               printer.tableCustom(
                   [
                       {text: "Item", align: "LEFT", width: 0.6, style: 'B'},
                       {text: "Tax", align: "CENTER", width: 0.2, style: 'B'},
                       {text: "Total", align: "RIGHT", width: 0.2, style: 'B'}
                   ]
               );

               for (let i = 0; i < items.length; i++) {
                   let item=items[i];
                   printer.tableCustom(
                       [
                           {text: item.name, align: "LEFT", width: 0.6, style: 'N'},
                           {text: "", align: "CENTER", width: 0.2, style: 'N'},
                           {text: "", align: "RIGHT", width: 0.2, style: 'N'}
                       ] // Optional
                   );
                   printer.tableCustom(
                       [
                           {text: `${item.quantity} ${item.unit_of_quantity} x ${item.unit_price}`, align: "LEFT", width: 0.6, style: 'N'},
                           {text: `${item.tax}`, align: "CENTER", width: 0.2, style: 'N'},
                           {text: `${item.price}`, align: "RIGHT", width: 0.2, style: 'N'}
                       ]
                   );

               }
               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);
               printer.tableCustom(
                   [
                       {text: "SUBTOTAL", align: "LEFT", width: 0.5, style: 'N'},
                       {text: `${total}`, align: "RIGHT", width: 0.5, style: 'N'}
                   ]
               );
               printer.tableCustom(
                   [
                       {text: "DISCOUNT", align: "LEFT", width: 0.5, style: 'N'},
                       {text: `${discount??0}`, align: "RIGHT", width: 0.5, style: 'N'}
                   ]
               );

               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);

               printer.tableCustom(
                   [
                       {text: "Code", align: "LEFT", width: 0.25, style: 'B'},
                       {text: "Rate", align: "LEFT", width: 0.25, style: 'B'},
                       {text: "Taxable", align: "LEFT", width: 0.25, style: 'B'},
                       {text: "Tax Amount", align: "LEFT", width: 0.25, style: 'B'},
                   ]
               );

               printer.tableCustom(
                   [
                       {text: "VAT", align: "LEFT", width: 0.25, style: 'B'},
                       {text: "16", align: "LEFT", width: 0.25, style: 'B'},
                       {text: `${total??0}`, align: "LEFT", width: 0.25, style: 'B'},
                       {text: `${tax??0}`, align: "LEFT", width: 0.25, style: 'B'},
                   ] // Optional
               );

               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);

               printer.tableCustom(
                   [
                       {text: "TOTAL(KES)", align: "LEFT", width: 0.5, style: 'B'},
                       {text: `${total}`, align: "RIGHT", width: 0.5, style: 'N'}
                   ]
               );

               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);
               printer.tableCustom(
                   [
                       {text: "PAYMENT METHOD", align: "LEFT", width: 0.5, style: 'B'},
                       {text: `${payment_method}`, align: "RIGHT", width: 0.5, style: 'N'}
                   ]
               );

               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);
               printer.tableCustom(
                   [
                       {text: "PIN", align: "LEFT", width: 0.5, style: 'B'},
                       {text: `${pin}`, align: "RIGHT", width: 0.5, style: 'N'}
                   ]
               );
               printer.align('ct').style('normal').size(0, 0).text(`------------------------------------------------`);

               printer.text("Powered by PEAKUNIFY");
               printer.align('ct').style('normal').size(0, 0).text(`\n`);
               printer.align('ct').style('normal').size(0, 0).text(`\n`).cut().close();
               res.status(200).send({
                   msg:'Print job completed'
               });
           } catch (error) {
               console.log('Error printing:', error);
               res.status(500).send({
                   msg:'Print job failed'
               });
           }
       });
   }catch (e) {
       console.log(e)
       res.status(500).send({
           msg:'Print job failed'
       });
   }
});

function loadImage(filePath) {
    return new Promise((resolve, reject) => {
        escpos.Image.load(filePath, image => resolve(image));
    });
}

app.listen(8100, () => {
    console.log('Print service running on port 8100');
});
