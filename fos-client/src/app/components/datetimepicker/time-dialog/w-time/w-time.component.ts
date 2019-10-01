import { CLOCK_TYPE, ITime } from '../w-clock/w-clock.component';
import { Utils } from '../utils';
import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output
  } from '@angular/core';
import moment from 'moment';

@Component({
  selector: 'w-time',
  templateUrl: './w-time.component.html',
  styleUrls: ['./w-time.component.less']
})
export class WTimeComponent implements OnInit {
  @Input() userTime: ITime;
  @Output() userTimeChange: EventEmitter<ITime> = new EventEmitter();

  @Input() revertLabel: string;
  @Input() submitLabel: string;

  @Output() onRevert: EventEmitter<null> = new EventEmitter();
  @Output() onSubmit: EventEmitter<ITime> = new EventEmitter();

  @Input() color: string;

  public VIEW_HOURS = CLOCK_TYPE.HOURS;
  public VIEW_MINUTES = CLOCK_TYPE.MINUTES;
  public currentView: CLOCK_TYPE = this.VIEW_HOURS;

  constructor() {}

  ngOnInit() {
    if (!this.userTime) {
      var now = Date.now();
      this.userTime = {
        hour: moment(now).format('HH'),
        minute: moment(now).format('mm'),
        meriden: 'PM',
        format: 24
      };
    }

    if (!this.revertLabel) {
      this.revertLabel = 'Cancel';
    }

    if (!this.submitLabel) {
      this.submitLabel = 'Okay';
    }
  }

  public formatHour(format, hour): string {
    return Utils.formatHour(format, hour);
  }

  public formatMinute(minute): string {
    return Utils.formatMinute(minute);
  }

  public setCurrentView(type: CLOCK_TYPE) {
    this.currentView = type;
  }

  public setMeridien(m: 'PM' | 'AM') {
    this.userTime.meriden = m;
  }

  public cancel() {
    this.onRevert.emit();
  }

  public submit() {
    // this.userTime.hour = this.formatHour(24, this.userTime.hour);
    // this.userTime.minute = this.formatHour(24, this.userTime.minute);
    this.onSubmit.emit(this.userTime);
  }

  public emituserTimeChange(event) {
    this.userTimeChange.emit(this.userTime);
  }
}