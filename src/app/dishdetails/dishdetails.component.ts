import { Component, OnInit, ViewChild} from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import {switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss']
})
export class DishdetailsComponent implements OnInit {

  
  dish: Dish;
  dishIds: String[];
  prev: String;
  next: String;
  commentForm: FormGroup;
  comment = {rating: 0, comment: '', author: '', date: ''};
  
  @ViewChild('cform') contactFormDirective;

  formErrors = {
    comment: '',
    author: ''
  };

  validationMessages = {
    'author': {
      'required':   'Author name is required.',
      'minlength':  'Author name must be atleast 2 characters long.',
      'maxlength':  'Author name cannot be more than 25 characters.',
    },
    'comment': {
      'required': 'Comment is required.'
    }
  };

  constructor(private dishService: DishService,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDIshIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
     this.route.params
      .pipe(switchMap((params: Params) => this.dishService.getDish(params['id'])))
      .subscribe(dish => {this.dish = dish; this.setPrevNext(dish.id)});            
  }

  setPrevNext(dishId: String){
    const index = this.dishIds.indexOf(dishId);
    this.prev = this.dishIds[(this.dishIds.length + index-1) % this.dishIds.length]
    this.next = this.dishIds[(this.dishIds.length + index+1) % this.dishIds.length]
  }

  goBack(): void{
    this.location.back();
  }

  createForm(){
    this.commentForm = this.fb.group({
      rating: '5',
      author: ['', [Validators.required,Validators.minLength(2), Validators.maxLength(25)]],
      comment: ['', Validators.required]
    });
    this.commentForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.commentForm) { return; }
    const form = this.commentForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = '';
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onSubmit(){
    let now = new Date().toISOString();
    this.comment ={
      rating: this.commentForm.value.rating,
      comment: this.commentForm.value.comment,
      author: this.commentForm.value.author,
      date:  now
    };
    console.log(this.comment);
    this.dish.comments.push(this.comment);
    this.contactFormDirective.resetForm();
    this.commentForm.setValue({author:null,rating:5,comment:null});
    
  }

}
