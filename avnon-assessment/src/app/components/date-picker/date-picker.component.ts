import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrl: './date-picker.component.scss'
})
export class DatePickerComponent implements OnInit {
  _startDate: Date | string = '';
  _endDate: Date | string = '';
  @Output() startDateEmitter: EventEmitter<any> = new EventEmitter<any>();
  @Output() endDateEmitter: EventEmitter<any> = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
    this.initDate();
  }

  initDate() {
    const start = new Date("2024-01-01");
    const end = new Date("2024-12-01");
    this._startDate = [start.getFullYear(), (start.getMonth() + 1).toString().padStart(2, '0')].join('-');
    this._endDate = [end.getFullYear(), (end.getMonth() + 1).toString().padStart(2, '0')].join('-');
    this.startDateEmitter.emit(this._startDate);
    this.endDateEmitter.emit(this._endDate);
  }

  get startDate() {
    return this._startDate;
  }

  set startDate(value: any) {
    this._startDate = value;
    console.log('start date', value)
    this.startDateEmitter.emit(value);
  }

  get endDate() {
    return this._endDate;
  }

  set endDate(value: any) {
    this._endDate = value;
    console.log('end date', value)
    this.endDateEmitter.emit(value);
  }
}
