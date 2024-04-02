import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';
import { Products } from '../models/Products';
import { CartService } from '../services/cart.service';
import { ProductsService } from '../services/products.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit{

  tempItems: any[] =[];
  cartItems: any[] = []
  userString: any = localStorage.getItem('user');
  user: any = JSON.parse(this.userString);
  price: number = 0;

  constructor(private cartService: CartService, private productService: ProductsService, private router: Router) {}

  ngOnInit(): void {
    this.loadCartItems();
  }
  
  loadCartItems() {
    this.cartService.getCartItems(this.user.email).subscribe((items) => {
      this.tempItems = items;
      this.sortItems();
      console.log(this.tempItems)

      const observables = this.tempItems.map(item => {
        // Call productService to get the product
        const productObservable = this.productService.getProductsById(item.productId);

        // Combine the productObservable with the quantity from tempItems
        return productObservable.pipe(
          map(product => ({ product, quantity: item.quantity }))
        );
      });
      
  
      forkJoin(observables).subscribe(products => {
        this.cartItems = products;
        
        // Calculate the total price after cartItems is populated
        this.calculateTotalPrice();
      });
    });
  }
  
  calculateTotalPrice() {
    this.price = 0;
    for (let product of this.cartItems) {
      this.price += parseFloat((product.product.price * product.quantity).toFixed(2));
    }
  }
  
  sortItems() {
    this.tempItems.sort((a, b) => a.productId - b.productId);
  }

  removeFromCart(id: number) {
    this.cartService.removeFromCart(this.user.email, id).subscribe(res => {
      this.cartItems = []
      this.loadCartItems();
    })
  }

  productSearch(product: string) {
    localStorage.setItem('searchStr', product)
    this.router.navigate(['/products'])
    if(this.router.url === "/products") { //only reloads the page if im already on products page
      window.location.reload() 
    } 
  }

}
