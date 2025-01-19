import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DatePickerComponent } from './components/date-picker/date-picker.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BudgetBuilderComponent } from './components/budget-builder/budget-builder.component';

@NgModule({
  declarations: [
    AppComponent,
    DatePickerComponent,
    BudgetBuilderComponent,
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  exports: [DatePickerComponent, BudgetBuilderComponent],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
