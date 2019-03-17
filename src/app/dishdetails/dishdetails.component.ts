import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { Params, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Dish } from '../shared/dish';
import { DishService } from '../services/dish.service';
import {switchMap } from 'rxjs/operators';
import { visibility, flyInOut, expand} from '../animations/app.animation';


@Component({
  selector: 'app-dishdetails',
  templateUrl: './dishdetails.component.html',
  styleUrls: ['./dishdetails.component.scss'],
  animations: [
    visibility(),
    flyInOut(),
    expand()
  ],
  host:{
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  }
})
export class DishdetailsComponent implements OnInit {

  
  dish: Dish;
  errMess: string;
  dishIds: String[];
  prev: String;
  next: String;
  commentForm: FormGroup;
  comment = {rating: 0, comment: '', author: '', date: ''};
  dishCopy: Dish;
  visibility = 'shown';
  
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
    private fb: FormBuilder,
    @Inject('BaseURL') private BaseURL) { 
      this.createForm();
    }

  ngOnInit() {
    this.dishService.getDishIds()
      .subscribe((dishIds) => this.dishIds = dishIds);
      this.route.params.pipe(switchMap((params: Params) => { this.visibility = 'hidden'; return this.dishService.getDish(+params['id']); }))
      .subscribe(dish => { this.dish = dish; this.dishCopy = dish; this.setPrevNext(dish.id); this.visibility = 'shown'; },
        errmess => this.errMess = <any>errmess);            
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
    this.dishCopy.comments.push(this.comment);
    this.dishService.putDish(this.dishCopy)
      .subscribe(dish => {
        this.dish = dish; this.dishCopy = dish;
      },
      errmess =>{this.dish = null; this.BaseURL.dishCopy = null; this.errMess = <any> errmess;})
    this.contactFormDirective.resetForm();
    this.commentForm.setValue({author:null,rating:5,comment:null});
    
  }

}
