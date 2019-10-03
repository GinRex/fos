import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Promotion } from 'src/app/models/promotion';
import { PromotionType } from 'src/app/models/promotion-type';
import { EventPromotionService } from 'src/app/services/event-promotion/event-promotion.service';
import { EventPromotion } from 'src/app/models/event-promotion';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-promotions-chip-list',
  templateUrl: './promotions-chip-list.component.html',
  styleUrls: ['./promotions-chip-list.component.less']
})
export class PromotionsChipListComponent implements OnInit {
  constructor(private eventPromotionService: EventPromotionService, private snackBar: MatSnackBar) { }

  @Input() deliveryId: number;
  @Input() eventId: string;
  @Output() promotionChanged: EventEmitter<Promotion[]> = new EventEmitter();

  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;

  eventPromotion: EventPromotion;
  promotions: Promotion[] = [];
  promotionOptions: Promotion[] = [];
  promotionType: PromotionType = PromotionType.DiscountAll;
  promotionValue: string = '10';

  ngOnInit() {
    const PromotionTypes = Object.keys(PromotionType).filter(key => !isNaN(Number(PromotionType[key])));
    PromotionTypes.forEach((type, index) => {
      if (index > 0) {
        const promotion = new Promotion();
        promotion.PromotionType = index;
        promotion.IsPercent = !(index === 2);
        this.promotionOptions.push(promotion);
      }
    });
    this.eventPromotionService.GetByEventId(Number(this.eventId)).then(eventPromotion => {
      this.eventPromotion = eventPromotion;
      this.promotions = this.eventPromotion.Promotions;
      this.promotionChanged.emit(this.promotions);
    });
  }

  getPromotionName(promotionType: number): string {
    return PromotionType[promotionType].split(/(?=[A-Z])/).join(' ');
  }

  isPromotionPercent(): boolean {
    return this.promotionOptions[this.promotionType - 1 ].IsPercent;
  }

  toast(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 2000
    });
  }

  updateEventPromotion() {
    this.eventPromotionService.UpdateEventPromotion(this.eventPromotion).then(response => {
      if (response === null) {
        this.toast("update success", "Dismiss");
      }
      if (response != null) {
        this.toast("update fail", "Dismiss");
      }
    });
  }

  addToPromotions() {
    const promotion = new Promotion();
    promotion.PromotionType = this.promotionType;
    promotion.Value = Number(this.promotionValue);
    promotion.IsPercent = this.isPromotionPercent();
    this.promotions.push(promotion);
    this.promotionChanged.emit(this.promotions);
    // console.log(this.promotions);
  }

  removePromotion(promotion: Promotion) {
    this.promotions = this.promotions.filter(pr => pr !== promotion);
    this.promotionChanged.emit(this.promotions);
  }

}
