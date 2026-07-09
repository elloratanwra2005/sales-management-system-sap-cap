using { sales as my } from '../db/schema';

service SalesService {

    entity Employees as projection on my.Employee;

    entity Customers as projection on my.Customer;

    entity Products as projection on my.Product;

    entity Sales as projection on my.Sales;

}