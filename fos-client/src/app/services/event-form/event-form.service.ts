import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { EventList } from "src/app/models/eventList";
import { MatSnackBar } from "@angular/material/snack-bar";
import { Observable } from "rxjs";
import { switchMap, debounceTime, tap, finalize } from "rxjs/operators";
import { User } from "src/app/models/user";
import { GraphUser } from "src/app/models/graph-user";
import { Event } from "src/app/models/event";

@Injectable({
  providedIn: "root"
})
export class EventFormService {
  toast(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }

  constructor(private http: HttpClient, private _snackBar: MatSnackBar) {}

  // GetAvatarByUserId(userId: string): Observable<ApiOperationResult<any>>{
  //     return this.http
  //     .get(
  //       environment.apiUrl + 'api/SPUser/GetAvatarByUserId',
  //       {
  //         params: {
  //           userId: userId
  //         }
  //       }
  //     )
  //     .pipe(
  //       tap((response: ApiOperationResult<Array<any>>) => {
  //         return response;
  //       })
  //     );
  // }

  AddEventListItem(
    eventlist: EventList
  ): Observable<ApiOperationResult<string>> {
    return this.http
      .post(
        environment.apiUrl +
          "api/SPList/AddEventListItem?Id=d7415c0c-8295-4851-bbe8-6717e939f7f6",
        {
          EventTitle: eventlist.EventTitle,
          EventRestaurant: eventlist.EventRestaurant,
          EventMaximumBudget: eventlist.EventMaximumBudget,

          EventTimeToClose: eventlist.EventTimeToClose,
          EventTimeToReminder: eventlist.EventTimeToReminder,
          EventHost: eventlist.EventHost,
          EventParticipants: eventlist.EventParticipants,

          EventCategory: eventlist.EventCategory,
          EventRestaurantId: eventlist.EventRestaurantId,
          EventServiceId: eventlist.EventServiceId,
          EventDeliveryId: eventlist.EventDeliveryId,
          EventCreatedUserId: eventlist.EventCreatedUserId,
          EventHostId: eventlist.EventHostId,
          EventDate: eventlist.EventDate,
          EventParticipantsJson: eventlist.EventParticipantsJson
        }
      )
      .pipe(
        tap((response: ApiOperationResult<string>) => {
          return response;
        })
      );
  }

  UpdateEventListItem(
    Id: String,
    eventlist: EventList
  ): Observable<ApiOperationResult<void>> {
    return this.http
      .post(environment.apiUrl + "api/SPList/UpdateListItem?Id=" + Id, {
        EventTitle: eventlist.EventTitle,
        EventRestaurant: eventlist.EventRestaurant,
        EventMaximumBudget: eventlist.EventMaximumBudget,

        EventTimeToClose: eventlist.EventTimeToClose,
        EventTimeToReminder: eventlist.EventTimeToReminder,
        EventHost: eventlist.EventHost,
        EventParticipants: eventlist.EventParticipants,

        EventCategory: eventlist.EventCategory,
        EventRestaurantId: eventlist.EventRestaurantId,
        EventServiceId: eventlist.EventServiceId,
        EventDeliveryId: eventlist.EventDeliveryId,
        EventCreatedUserId: eventlist.EventCreatedUserId,
        EventHostId: eventlist.EventHostId,
        EventDate: eventlist.EventDate,
        EventParticipantsJson: eventlist.EventParticipantsJson
      })
      .pipe(
        tap((response: ApiOperationResult<void>) => {
          return response;
        })
      );
  }

  SearchUserByName(
    searchText: string
  ): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "api/SPUser/searchUserByName",
        {
          params: {
            searchText: searchText
          }
        }
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }

  getCurrentUser(): Observable<ApiOperationResult<GraphUser>> {
    return this.http
      .get<ApiOperationResult<GraphUser>>(
        environment.apiUrl + "api/SPUser/GetCurrentUserGraph"
      )
      .pipe(
        tap((response: ApiOperationResult<GraphUser>) => {
          return response;
        })
      );
  }

  GetMemberInGroups(
    groupId: string
  ): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "/api/SPUser/GetMemberInGroups",
        {
          params: {
            groupId: groupId
          }
        }
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }

  GetUsersByName(
    searchName: string
  ): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "/api/SPUser/GetUsersByName",
        {
          params: {
            searchName: searchName
          }
        }
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }

  GetGroups(): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "/api/SPUser/GetGroups"
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }

  GetUsers(): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "/api/SPUser/GetUsers"
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }

  GroupListMemers(
    groupId: string
  ): Observable<ApiOperationResult<Array<User>>> {
    return this.http
      .get<ApiOperationResult<Array<User>>>(
        environment.apiUrl + "/api/SPUser/GroupListMemers",
        {
          params: {
            groupId: groupId
          }
        }
      )
      .pipe(
        tap((response: ApiOperationResult<Array<User>>) => {
          return response;
        })
      );
  }
  GetEventById(id: string): Promise<Event> {
    return new Promise<Event>((resolve, reject) => {
      this.http
        .get<ApiOperationResult<Event>>(
          environment.apiUrl + "api/splist/GetEventById",
          {
            params: {
              id: id
            }
          }
        )
        .toPromise()
        .then(result => {
          if (result.Success) {
            resolve(result.Data);
          }
        })
        .catch(alert => console.log(alert));
    });
  }
}