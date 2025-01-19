import { Component, ElementRef, Input, OnChanges, OnInit, ViewChild } from '@angular/core';
import { Category } from '../../models';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, of, Subscription, switchMap } from 'rxjs';

enum TYPE_BUDGET {
  INCOME = 'Income',
  EXPENSES = 'Expenses'
}
@Component({
  selector: 'budget-builder',
  templateUrl: './budget-builder.component.html',
  styleUrl: './budget-builder.component.scss'
})
export class BudgetBuilderComponent implements OnInit, OnChanges {
  @Input() startDate: Date | string = '';
  @Input() endDate: Date | string = '';
  @ViewChild('apllyAllIncomBtn') apllyAllIncomBtn: ElementRef<HTMLElement>
  @ViewChild('apllyAllExpenseBtn') apllyAllExpenseBtn: ElementRef<HTMLElement>
  rangeMonth: Array<string> = [];
  incomeCategoryForm: FormGroup;
  expensesCategoryForm: FormGroup;
  formValueSubcription: Subscription;
  listI: number
  subListI: number
  valueI: number
  Type_Budget = TYPE_BUDGET;
  deleteRowOnly: boolean = false;
  constructor(private _fb: FormBuilder) { }

  ngOnInit(): void { }

  ngOnChanges(): void {
    this.rangeMonth = this.dateRange(this.startDate, this.endDate);
    this.initForm();
    this.formValueSubcription?.unsubscribe();
    this.listenCategoryForm(this.incomeCategoryForm);
    this.listenCategoryForm(this.expensesCategoryForm);
  }

  initForm() {
    const initVal = Array(this.rangeMonth.length).fill(0);
    function createForm(_fb: FormBuilder) {
      return _fb.group({
        categoryList: _fb.array([]),
        totals: _fb.array(initVal.map(x => (x))),
      })
    }
    this.incomeCategoryForm = createForm(this._fb);
    this.expensesCategoryForm = createForm(this._fb);
  }

  listenCategoryForm(form: FormGroup) {
    if (!form) return;
    this.formValueSubcription = form.valueChanges.pipe(distinctUntilChanged(), debounceTime(400), switchMap(val => of(val))).subscribe(changeValue => {
      if (!changeValue.categoryList.length) return;
      const cateSubTotals: any = [];
      (changeValue.categoryList as Array<Category>)
        .forEach((cate: Category, listIdx) => {
          if (!cate.subCategoryList.length) return;
          const subCateValues = cate.subCategoryList.map(sub => sub.values);
          const subTotals = this.combineTotalArrayValue(subCateValues, this.rangeMonth.length);
          this.updateSubTotals(form, subTotals, listIdx);
          cateSubTotals.push(cate.subTotals.map(sub => sub));
        })
      const totals = this.combineTotalArrayValue(cateSubTotals, this.rangeMonth.length);
      this.updateTotals(form, totals);
    })
  }

  combineTotalArrayValue(arrVal: any[], length: number) {
    let subTotals: any = [];
    for (let i = 0; i < length; i++) {
      let arrValue: any = [];
      arrVal.forEach(val => arrValue.push(+val[i]));
      let sumArrayValue = arrValue.reduce((result: any, current: any) => result += current, 0)
      subTotals.push(sumArrayValue);
    }
    return subTotals;
  }

  updateTotals(form: FormGroup, totals: number[]) {
    return form?.patchValue({
      totals: [...totals]
    }, { emitEvent: true })
  }

  updateSubTotals(form: FormGroup, subTotals: number[], listIdx: number) {
    return (form?.controls['categoryList'] as FormArray).controls[listIdx]?.patchValue({
      subTotals: [...subTotals]
    }, { emitEvent: false })
  }

  getTotals(form: FormGroup) {
    return form?.controls['totals'].value as any;
  }

  getCategoryList(form: FormGroup) {
    return form.get('categoryList') as FormArray;
  }

  getCategorySubList(form: FormGroup, listIdx: number) {
    return (this.getCategoryList(form).controls[listIdx] as FormGroup).get('subCategoryList') as FormArray
  }

  getValuesList(form: FormGroup, listIdx: number, subListIdx: number) {
    return ((((this.getCategoryList(form).controls[listIdx] as FormGroup)
      .get('subCategoryList') as FormArray).controls[subListIdx] as FormGroup).get('values') as FormArray)
  }

  getSubTotals(form: FormGroup, listIdx: number) {
    return ((this.getCategoryList(form).controls[listIdx] as FormGroup).get('subTotals') as FormArray)?.controls;
  }

  generateCategoryForm(name: string) {
    const initVal = Array(this.rangeMonth.length).fill(0)
    return this._fb.group({
      categoryName: name,
      subCategoryList: new FormArray([]),
      subTotals: new FormArray(initVal.map(x => new FormControl(x))),
    })
  }

  generateSubCategoryForm(name: string) {
    const initVal = Array(this.rangeMonth.length).fill(0)
    return this._fb.group({
      subCategoryName: name,
      values: new FormArray(initVal.map(x => new FormControl(x))),

    })
  }

  dateRange(startDate: Date | string, endDate: Date | string) {
    let start = new Date(startDate);
    let end = new Date(endDate);
    const dates = [];
    while (start.getTime() <= end.getTime()) {
      const displayMonth = start.getUTCMonth() + 1;
      dates.push([
        start.getUTCFullYear(),
        (displayMonth).toString().padStart(2, '0'),
        '01',
      ].join('-'));

      start = new Date(start.setUTCMonth(displayMonth));
    }
    return dates;
  }

  onCategoryInput(form: FormGroup, event: any) {
    const keyCodeEnter = 13;
    const cateName = event.target.value
    if (event.keyCode !== keyCodeEnter || (cateName.trim() == '')) return;
    this.categoryEnter(form, cateName);
    event.target.value = '';
  }

  categoryEnter(form: FormGroup, nameCate: string) {
    let arr = this.getCategoryList(form);
    arr.push(this.generateCategoryForm(nameCate))

  }

  onSubCategoryInput(form: FormGroup, event: any, listIdx: number) {
    const keyCodeEnter = 13;
    const subCateName = event.target.value;
    if (event.keyCode !== keyCodeEnter || (subCateName.trim() == '')) return;
    let arr = (this.getCategoryList(form).controls[listIdx] as FormGroup).get('subCategoryList') as FormArray;
    arr.push(this.generateSubCategoryForm(subCateName));
    event.target.value = '';
  }

  onRightClick(typeBudget: TYPE_BUDGET, listIdx: number, subListIdx: number, valueIdx: number, event: any, deleteRowOnly: boolean = false) {
    event.preventDefault();
    this.deleteRowOnly = deleteRowOnly;
    switch (typeBudget) {
      case this.Type_Budget.INCOME:
        this.apllyAllIncomBtn.nativeElement.click();
        break;
      case this.Type_Budget.EXPENSES:
        this.apllyAllExpenseBtn.nativeElement.click();
        break;
    }

    this.listI = listIdx;
    this.subListI = subListIdx;
    this.valueI = valueIdx;
  }

  applyAllValue(form: FormGroup) {
    if (this.deleteRowOnly) return;
    const valuesList = ((this.getCategoryList(form).controls[this.listI] as any).get('subCategoryList')).controls[this.subListI];
    const currentval = this.getValuesList(form, this.listI, this.subListI).controls[this.valueI].value;
    const lengthArr = this.rangeMonth.length;
    const arrayVal = Array.from({ length: lengthArr }, () => currentval)
    valuesList.patchValue({ values: arrayVal });
  }

  deleteRow(form: FormGroup) {
    const subCate = ((this.getCategoryList(form).controls[this.listI] as any).get('subCategoryList'))
    subCate.removeAt(this.subListI);
    if (subCate.value.length == 0) {
      const initValue = Array(this.rangeMonth.length).fill(0);
      (this.getCategoryList(form).controls[this.listI] as any)?.patchValue({
        subTotals: initValue
      })
    }
  }

  get profitLoss() {
    const totalIncome = this.incomeCategoryForm.get('totals')?.value;
    const totalExpenses = this.expensesCategoryForm.get('totals')?.value;
    return totalIncome.map((income: number, index: number) => (income - totalExpenses[index]));
  }

  get balance() {
    const initValue = Array(this.rangeMonth.length).fill(0);
    let balance = {
      opening: [...initValue],
      closing: [...initValue]
    }
    return balance.opening.reduce((result, current, currentIndex) => {
      result.closing[currentIndex] = result.opening[currentIndex] + this.profitLoss[currentIndex];
      if (result.opening[currentIndex + 1] <= result.opening.length) {
        result.opening[currentIndex + 1] = result.closing[currentIndex];
      }
      return result;
    }, balance);
  }

  moveCell(event: any, typeBudget: string, listIdx: number, subListIdx: number, valueIdx: number) {
    const idNextInput = `${typeBudget}-${listIdx}-${subListIdx}-${valueIdx + 1}`
    const idPreviousInput = `${typeBudget}-${listIdx}-${subListIdx}-${valueIdx - 1}`
    if (event.key == "ArrowLeft") {
      const htmlEl = document.getElementById(idPreviousInput);
      htmlEl?.focus();
    }
    if (event.key == "ArrowRight") {
      const htmlEl = document.getElementById(idNextInput);
      htmlEl?.focus();
    }
  }

}
