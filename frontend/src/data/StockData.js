import Coffee from "../assets/Beans.png";
import Milk from "../assets/Milk.jpg";
import Caramel from "../assets/Syrup.jpg";
import Cup from "../assets/Cup.jpg";

export const StockData = [
  {
    id: 1,
    image: Caramel,
    name: "Caramel Syrup",
    category: "Syrup",
    unit: "Bottle",
    unitCost: 85000,
    stock: 7,
    value: 595000,
    status: "Low Stock",
  },
  {
    id: 2,
    image: Milk,
    name: "Fresh Milk",
    category: "Milk",
    unit: "Bottle",
    unitCost: 22000,
    stock: 5,
    value: 110000,
    status: "Low Stock",
  },
  {
    id: 3,
    image: Coffee,
    name: "Arabica Coffee Bean",
    category: "Coffee Bean",
    unit: "Kg",
    unitCost: 180000,
    stock: 3,
    value: 540000,
    status: "Out of Stock",
  },
  {
    id: 4,
    image: Cup,
    name: "Paper Cup 16 oz",
    category: "Packaging",
    unit: "Pcs",
    unitCost: 1200,
    stock: 40,
    value: 48000,
    status: "In Stock",
  },
];
