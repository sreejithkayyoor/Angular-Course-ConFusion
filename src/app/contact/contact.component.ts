import { Component, OnInit, createPlatform, ViewChild, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Feedback, ContactType } from '../shared/feedback';
import { FeedbackService } from '../services/feedback.service'
import { flyInOut, expand, response, visibility } from '../animations/app.animation';
import { timeout } from 'rxjs/operators';


@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  host:{
    '[@flyInOut]': 'true',
    'style': 'display: block;'
  },
  animations: [
    flyInOut(),
    expand(),
    response(),
    visibility()
  ]
})
export class ContactComponent implements OnInit {

  feedbackForm: FormGroup;
  feedback: Feedback;
  errMess: string;
  contactType = ContactType;
  feedBackResponse: Feedback;
  waiting = false;
  // timeout:boolean;
  responseFlag=false;
  formAnimation:string;
  @ViewChild('fform') feedbackFormDirective;

  formErrors = {
    'firstname': '',
    'lastname': '',
    'telnum': '',
    'email': ''
  };

  validationMessages = {
    'firstname': {
      'required':   'First name is required.',
      'minlength':  'First name must be atleast 2 characters long.',
      'maxlength':  'First name cannot be more than 25 characters.',
    },
    'lastname': {
      'required':   'Last name is required.',
      'minlength':  'Last name must be atleast 2 characters long.',
      'maxlength':  'Last name cannot be more than 25 characters.',
    },
    'telnum':{
      'required':   'Tel. number is required.',
      'pattern':  'Tel. number must contain only numbers.'
    },
    'email': {
      'required': 'Email is required.',
      'email':    'Email not in valid format.'
    },
  };

  constructor(private fb: FormBuilder,
    private feedbackService: FeedbackService,
    @Inject('BaseURL') private BaseURL) {
    this.createForm();
  }

  ngOnInit() {
  }

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: ['', [Validators.required,Validators.minLength(2), Validators.maxLength(25)]],
      lastname: ['', [Validators.required,Validators.minLength(2), Validators.maxLength(25)]],
      telnum: ['', [Validators.required, Validators.pattern]],
      email: ['', [Validators.required, Validators.email]],
      agree: false,
      contacttype: 'None',
      message: ''
    });

    this.feedbackForm.valueChanges
      .subscribe(data => this.onValueChanged(data));

    this.onValueChanged(); // (re)set validation messages now

  }
  onValueChanged(data?: any) {
    if (!this.feedbackForm) { return; }
    const form = this.feedbackForm;
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
  onSubmit() {
    this.waiting = true;
    this.feedback = this.feedbackForm.value;
    console.log(this.feedback);
    this.feedbackService.submitFeeback(this.feedback)
      .subscribe(feedback=>{
        this.feedBackResponse = feedback,
        this.waiting = false,
        setTimeout(()=>{
          this.feedBackResponse = null},5000)        
      },
      errmess =>{this.feedBackResponse = null, this.errMess = <any> errmess, this.waiting = false});
    this.feedbackFormDirective.resetForm();
  }

}
