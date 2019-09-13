import { Component, OnInit, ViewChild, Input } from "@angular/core";
import { User } from "src/app/models/user";
import { Order } from "src/app/models/order";
import { MatSort, MatPaginator, MatTableDataSource } from "@angular/material";
import { Food } from "src/app/models/food";
import { FoodDetailJson } from "src/app/models/food-detail-json";
import {
  FLOAT,
  float
} from "html2canvas/dist/types/css/property-descriptors/float";
import { Event } from "src/app/models/event";

@Component({
  selector: "app-list-ordered-foods",
  templateUrl: "./list-ordered-foods.component.html",
  styleUrls: ["./list-ordered-foods.component.less"]
})
export class ListOrderedFoodsComponent implements OnInit {
  @Input() user: User;
  @Input() event: Event;
  @Input() order: Order;
  @Input("isOrder") isOrder: boolean;

  @ViewChild(MatSort, { static: true }) sort: MatSort;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  foodOrdered: Food;
  displayedColumns2: string[] = ["name", "price", "amount", "total", "comment"];
  dataSource2: MatTableDataSource<FoodDetailJson>;
  public FoodOfAmount: any = {};
  constructor() {}
  load = true;
  @Input() totalBudget: Number;
  ngOnInit() {
    this.dataSource2 = new MatTableDataSource<FoodDetailJson>();
    console.log(this.user.DisplayName);
    this.updateTable();
  }
  Caculator() {
    this.dataSource2.data;
  }
  MapFoodCheck2FoodDetail(food: Food): FoodDetailJson {
    return {
      IdFood: food.Id,
      Value: {
        ["Name"]: food.Name,
        ["Price"]: food.Price.toString(),
        ["Amount"]: "1",
        ["Total"]: food.Price.toString(),
        ["Comment"]: "Noté",
        ["Photo"]: food.Photos,
      }
    };
  }
  AddFoodDetail(food: FoodDetailJson) {
    this.dataSource2.data.unshift(food);
    this.dataSource2.filter = "";
  }
  DeleteFoodDetail(food: Food) {
    var deleteItem = this.dataSource2.data.findIndex(x => x.IdFood == food.Id);
    this.dataSource2.data.splice(deleteItem, 1);
    this.dataSource2.filter = "";
  }
  numberWithCommas(x: Number) {
    if (x != undefined) {
      var parts = x.toString().split(".");
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
    }
  }
  getTotalCost() {
    return this.dataSource2.data
      .map(t => Number(t.Value["Total"]))
      .reduce((acc, value) => acc + value, 0);
  }
  onBlurMethodAmount(amount: number, food: FoodDetailJson) {
    var getItem = this.dataSource2.data.findIndex(x => x.IdFood == food.IdFood);
    var f = this.dataSource2.data[getItem];
    f.Value["Amount"] = amount.toString();
    f.Value["Total"] = (
      Number(f.Value["Amount"]) * Number(f.Value["Price"])
    ).toString();
    this.dataSource2.data[getItem] = f;
    this.dataSource2.filter = "";
  }
  onBlurMethodComment(text: string, food: FoodDetailJson) {
    var getItem = this.dataSource2.data.findIndex(x => x.IdFood == food.IdFood);
    this.dataSource2.data[getItem].Value["Comment"] = text;
    this.dataSource2.filter = "";
  }
  getAllFoodDetail(): FoodDetailJson[] {
    return this.dataSource2.data;
  }
  // setTotalPrice(){
  //   this.dataSource2.data.forEach(f =>{
  //     f.Value["Total"] = (Number(f.Value["Amount"])*Number(f.Value["Price"])).toString()
  //   })
  // }
  updateTable() {
    this.dataSource2.data = this.order.FoodDetail;
    this.dataSource2.sort = this.sort;
    this.dataSource2.paginator = this.paginator;
    this.load = false;
  }
}
