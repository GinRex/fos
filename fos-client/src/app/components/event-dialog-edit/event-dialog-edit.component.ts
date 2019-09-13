import { Event } from './../../models/event';
import {
  MatSort,
  MatPaginator,
  MatTableDataSource,
  MatTable,
  MatSnackBar
} from '@angular/material';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA
} from '@angular/material/dialog';
import {
  FormControl,
  FormGroup,
  Validators,
  FormBuilder
} from '@angular/forms';
import { Component, Inject, OnInit, ViewChild, Input } from '@angular/core';
import { EventFormService } from 'src/app/services/event-form/event-form.service';
import { RestaurantService } from 'src/app/services/restaurant/restaurant.service';
import {
  userPickerGroup,
  userPicker
} from '../event-dialog/event-dialog.component';
import { EventUser } from 'src/app/models/eventuser';
import { DeliveryInfos } from 'src/app/models/delivery-infos';
import { debounceTime, tap, switchMap, finalize } from 'rxjs/operators';
import { User } from 'src/app/models/user';
import { GraphUser } from 'src/app/models/graph-user';

@Component({
  selector: 'app-event-dialog-edit',
  templateUrl: './event-dialog-edit.component.html',
  styleUrls: ['./event-dialog-edit.component.less']
})
export class EventDialogEditComponent implements OnInit {
  @ViewChild(MatTable, { static: true }) table: MatTable<any>;
  public ownerForm: FormGroup;
  constructor(@Inject(MAT_DIALOG_DATA) public data: Event,
  private eventFormService: EventFormService,
  private restaurantService: RestaurantService,
  public dialogRef: MatDialogRef<EventDialogEditComponent>,
  private _snackBar: MatSnackBar) { }
  //global
  _eventSelected = 'Open';
  _createdUser = { id: '' };
  _dateEventTime: string;
  _dateTimeToClose: string;
  _dateToReminder: string;
  _maximumBudget: number;
  _userSelect = [];
  _userPickerGroups: userPickerGroup[] = [];

  private ToDateString(date: Date): string {
    return (
      date.getFullYear().toString() +
      '-' +
      ('0' + (date.getMonth() + 1)).slice(-2) +
      '-' +
      ('0' + date.getDate()).slice(-2) +
      'T' +
      date.toTimeString().slice(0, 5)
    );
  }

  _eventUsers: EventUser[] = [];

  _hostPickerGroup = [];

  _displayedColumns = ['avatar', 'name', 'email', 'order status', 'action'];

  _isLoading = false;
  _isHostLoading = false;
  _restaurant: DeliveryInfos[];
  _userHost: userPicker[];
  _office365User: userPicker[] = [];
  _office365Group: userPicker[] = [];
  _loading: boolean;
  displayFn(user: DeliveryInfos) {
    if (user) {
      return user.Name;
    }
  }

  displayUser(user: userPicker) {
    if (user) {
      return user.Name;
    }
  }

  ngOnInit() {
    var self = this;
    //get user
    this.eventFormService
      .GetUsers()
      .toPromise()
      .then(u => {
        u.Data.map(us => {
          if (us.Mail) {
            this._office365User.push({
              Name: us.DisplayName,
              Email: us.Mail,
              Img: '',
              Id: us.Id,
              IsGroup: 0
            });
          }
        });
      });
    this._userPickerGroups.push({
      Name: 'User',
      UserPicker: this._office365User
    });
    //get group
    this.eventFormService
      .GetGroups()
      .toPromise()
      .then(value => {
        value.Data.map(user => {
          if (user.Id && user.Mail) {
            this._office365Group.push({
              Name: user.DisplayName,
              Email: user.Mail,
              Img: '',
              Id: user.Id,
              IsGroup: 1
            });
          }
        });
      });
    this._userPickerGroups.push({
      Name: 'Office 365 Group',
      UserPicker: this._office365Group
    });

    this.ownerForm = new FormGroup({
      title: new FormControl('', [Validators.required]),
      dateTimeToClose: new FormControl(''),
      participants: new FormControl(''),
      restaurant: new FormControl(''),
      userInput: new FormControl(''),
      userInputHost: new FormControl(''),
      EventType: new FormControl('')
    });

    this.ownerForm.get('title').setValue(this.data.Name);
    this.ownerForm.get('EventType').setValue(this.data.EventType);

    var dataHostTemp: userPicker = {
      Name: this.data.HostName,
      Email: '',
      Img: '',
      Id: this.data.HostId,
      IsGroup: 0
    };
    this.ownerForm.get('userInputHost').setValue(dataHostTemp);
    this._maximumBudget = Number(this.data.MaximumBudget);

    var newCloseTime = new Date(this.data.CloseTime);
    var closeTime = this.ToDateString(newCloseTime);
    this._dateTimeToClose = closeTime;

    var newRemindTime = new Date(this.data.RemindTime);
    var remindTime = this.ToDateString(newRemindTime);
    this._dateToReminder = remindTime;

    var newEventDate = new Date(this.data.EventDate);
    var eventTime = this.ToDateString(newEventDate);
    this._dateEventTime = eventTime;

    //restaurant
    var restaurantTemp: DeliveryInfos = {
      CityId: '1',
      RestaurantId: this.data.RestaurantId,
      IsOpen: '',
      IsFoodyDelivery: '',
      Campaigns: '',
      PromotionGroups: '',
      Photo: '',
      Operating: '',
      Address: '',
      DeliveryId: this.data.DeliveryId,
      Categories: this.data.Category,
      Name: this.data.Restaurant,
      UrlRewriteName: '',
      IsFavorite: false
    };

    this.ownerForm.get('userInput').setValue(restaurantTemp);
    this.ownerForm
      .get('userInput')
      .valueChanges.pipe(
        debounceTime(300),
        tap(() => (this._isLoading = true)),
        switchMap(value =>
          this.restaurantService
            .SearchRestaurantName(value, 4)
            .pipe(finalize(() => (this._isLoading = true)))
        )
      )
      .subscribe(data =>
        this.restaurantService.getRestaurants(data.Data).then(result => {
          this._restaurant = result;
          this._isLoading = false;
        })
      );

    //Host
    this.ownerForm
      .get('userInputHost')
      .valueChanges.pipe(
        debounceTime(300),
        tap(() => (this._isHostLoading = true)),
        switchMap(value =>
          this.eventFormService
            .GetUsersByName(value)
            .pipe(finalize(() => (this._isHostLoading = false)))
        )
      )
      .subscribe((data: ApiOperationResult<Array<User>>) => {
        if (data && data.Data) {
          var dataSourceTemp: userPicker[] = [];
          console.log(data.Data);

          data.Data.map(user => {
            if (user.UserPrincipalName) {
              dataSourceTemp.push({
                Name: user.DisplayName,
                Email: user.UserPrincipalName,
                Img: '',
                Id: user.Id,
                IsGroup: 0
              });
            }
          });

          self._userHost = dataSourceTemp;
          console.log('loading', self._userHost);
          this._isHostLoading = false;
        }
      });
    //load table
    var participants = JSON.parse(this.data.EventParticipantsJson);
    participants.map(value => {
      console.log('paricipant ', value);
      this._eventUsers.push({
        Id: value.id,
        Name: value.displayName,
        Img: '',
        Email: value.mail,
        IsGroup: 0
      });
    });
  }
  public HasError = (controlName: string, errorName: string) => {
    return this.ownerForm.controls[controlName].hasError(errorName);
  };

  OnNoClick(): void {
    this.dialogRef.close();
  }

  UpdateToSharePointEventList(): void {
    if (this._eventUsers.length == 0) {
      this.toast("Please choose participants!", "Dismiss");
      return;
    }
    this._loading = true;
    var self = this;

    var host = this.ownerForm.get('userInputHost').value.Name;
    console.log('get host: ', host);

    var title = this.ownerForm.get('title').value;
    console.log('get title: ',title);

    var EventType = this.ownerForm.get('EventType').value;
    console.log('get title: ',EventType);

    var maximumBudget = this._maximumBudget;
    console.log('get maximumBudget: ',maximumBudget);

    var eventDate = this._dateEventTime;
    console.log('get eventDate: ',eventDate);

    var dateTimeToClose = this._dateTimeToClose.replace('T', ' ');
    console.log('get dateTimeToClose: ',dateTimeToClose);

    var dateToReminder = this._dateToReminder.replace('T', ' ');
    console.log('get dateToReminder: ',dateToReminder);

    var restaurant = this.ownerForm.get('userInput').value.Name;
    console.log('get restaurant: ');
    console.log(restaurant);

    var restaurantId = this.ownerForm.get('userInput').value.RestaurantId;
    console.log('get restaurantId: ');
    console.log(restaurantId);

    var category = this.ownerForm.get('userInput').value.Categories;
    console.log('get category: ');
    console.log(category);

    var deliveryId = this.ownerForm.get('userInput').value.DeliveryId;
    console.log('get deliveryId: ');
    console.log(deliveryId);

    var eventType = this.ownerForm.get('userInput').value.EventType;
    console.log('get eventType: ');
    console.log(eventType);

    var serciveId = 1;
    console.log('get serciveId: ');
    console.log(serciveId);

    var hostId = this.ownerForm.get('userInputHost').value.Id;
    console.log('get hostId: ');
    console.log(hostId);

    console.log('get createUserId: ');
    console.log(this.data.CreatedBy);
    var jsonParticipants: GraphUser[] = [];
    var numberParticipant = 0;

    this._eventUsers.map(
      user => {
        if (user.IsGroup === 0) {
          var check = false;
          jsonParticipants.map(mem => {
                    
            if (mem.displayName === user.Name) {
              check = true;
            }
          });
          if (check === false) {
            var participant: GraphUser = {
              id: user.Id,
              displayName: user.Name,
              mail: user.Email,
              userPrincipalName: user.Name
            };
            jsonParticipants.push(participant);
            numberParticipant++;
          }
        }
      });

    this._eventUsers.map(
      user =>{
        if(user.IsGroup ===1){
          this.eventFormService.GroupListMemers(user.Id).toPromise().then(
            value =>{
              value.Data.map(
                u =>{
                  var check = false;
                  jsonParticipants.map(mem => {
                    
                    if (mem.displayName === u.DisplayName) {
                      check = true;
                    }
                  });
                  if (check === false) {
                    var participant: GraphUser = {
                      id: u.Id,
                      displayName: u.DisplayName,
                      mail: u.Mail,
                      userPrincipalName: u.DisplayName
                    };
                    jsonParticipants.push(participant);
                    numberParticipant++;
                  }
                }
              )
            }
          )
        }
      }
    )
    
    setTimeout(function () {
      console.log('final', jsonParticipants);
      var myJSON = JSON.stringify(jsonParticipants);
      console.log('final', myJSON);

    var eventListitem: Event = {
      Name: title,
      EventId: title,
      Restaurant: restaurant,
      MaximumBudget: maximumBudget.toString(),
      CloseTime: new Date(dateTimeToClose),
      RemindTime: new Date(dateToReminder),
      HostName: host,
      Participants: numberParticipant.toString(),
      Category: category,
      RestaurantId: restaurantId,
      ServiceId: '1',
      DeliveryId: deliveryId,
      CreatedBy: this._createdUser.id,
      HostId: hostId,
      EventDate: new Date(eventDate),
      EventParticipantsJson: myJSON,
      EventType: eventType,
      Action: null,
      IsMyEvent: null,
      Status: null
    };
    
    
    this.eventFormService.UpdateEventListItem(this.data.EventId, eventListitem).toPromise().then(
      result =>{
        console.log('Update', result);
        this.toast("update new event!", "Dismiss");
        this.dialogRef.close();
      }
    )
  }
  toast(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000
    });
  }
  
  AddUserToTable(): void {
    console.log('Nhan add card');

    console.log(this._userSelect);

    for (var s in this._userSelect) {
      var flag = false;
      for (var e in this._eventUsers) {
        if (this._userSelect[s].Name == this._eventUsers[e].Name) {
          flag = true;
        }
      }

      if (flag == false) {
        console.log(this._userSelect[s]);

        this._eventUsers.push({
          Name: this._userSelect[s].Name,
          Email: this._userSelect[s].Email,
          Img: '',
          Id: this._userSelect[s].Id,
          IsGroup: this._userSelect[s].IsGroup
        });
        this.table.renderRows();
      }
    }
  }

  DeleteUserInTable(name: string): void {

    console.log('xoa ', name);
    for (var j = 0; j < this._eventUsers.length; j++) {
      if (name == this._eventUsers[j].Name) {
        this._eventUsers.splice(j, 1);

        j--;
        this.table.renderRows();
      }
    }
  }

  public CreateOwner = ownerFormValue => {
    if (this.ownerForm.valid) {
      console.log('pass');
    }
  };

  ChangeClient(event) {
    console.log('change client', event.value);

    let target = event.source.selected._element.nativeElement;
    this._userSelect = [];

    const toSelect = this._office365User.find(c => c.Email == event.value.Email);
    const toSelectGroup = this._office365Group.find(
      c => c.Email == event.value.Email
    );

    console.log('toSelect', toSelect);
    console.log('toSelectGroup', toSelectGroup);
    if (toSelect != null) {
      this._userSelect.push({
        Name: toSelect.Name,
        Email: toSelect.Email,
        Img: '',
        Id: toSelect.Id,
        IsGroup: 0
      });
    } else {
      this._userSelect.push({
        Name: toSelectGroup.Name,
        Email: toSelectGroup.Email,
        Img: '',
        IsGroup: 1,
        Id: toSelectGroup.Id
      });
    }
  }
}
