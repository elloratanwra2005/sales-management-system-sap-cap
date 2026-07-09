namespace sales;

using { cuid } from '@sap/cds/common';

entity Employee : cuid {

    employeeID : String(10);
    name       : String(100);
    password   : String(100);
    department : String(50);
    email      : String(100);

}

entity Customer : cuid {

    customerName : String(100);

    phone        : String(15);

    email        : String(100);

    address      : String(200);

}

entity Product : cuid {

    productID   : String(10);
    productName : String(100);
    category    : String(50);
    price       : Decimal(10,2);
    stock       : Integer;

}

entity Sales : cuid {

    saleID : String(10);

    employee : Association to Employee;

    customer : Association to Customer;

    product : Association to Product;

    quantity : Integer;

    totalAmount : Decimal(10,2);

    saleDate : Date;

}