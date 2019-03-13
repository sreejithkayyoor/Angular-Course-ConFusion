import { Injectable } from '@angular/core';
import { Leader } from '../shared/leader';
import { resolve } from 'url';
import {Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { baseURL } from '../shared/baseurl';

@Injectable({
  providedIn: 'root'
})
export class LeaderService {

  constructor( private http: HttpClient ) { }

  getLeaders(): Observable<Leader[]>{
    return this.http.get<Leader[]>(baseURL + 'leadership')
  }

  getFeatureLeader(): Observable<Leader>{
    return this.http.get<Leader>(baseURL + 'leadership?featured=true').pipe(map(leader => leader[0]));
  }
}
