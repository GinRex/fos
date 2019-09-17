﻿using FOS.CoreService.EventServices;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Linq;
using System.ServiceProcess;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.IO;
using Unity;
using FOS.CoreService.UnityConfig;
using FOS.CoreService.Constants;
using Microsoft.SharePoint.Client;
using FOS.Model.Domain.NowModel;
using Newtonsoft.Json;
using FOS.Model.Dto;
using Microsoft.SharePoint.Client.Utilities;
using System.Configuration;

namespace FOS.ReminderService
{
    public partial class Service1 : ServiceBase
    {
        Timer timer = new Timer();
        FosCoreService coreService;
        static EmailTemplate emailTemplate;
        public Service1()
        {
            InitializeComponent();
        }

        protected override void OnStart(string[] args)
        {
            var container = new UnityContainer();
            RegisterUnity.Register(container);
            coreService = container.Resolve<FosCoreService>();

            WriteToFile("Service is started at " + DateTime.Now);
            timer.Elapsed += new ElapsedEventHandler(OnElapsedTime);
            timer.Interval = 6000; //number in milisecinds  
            timer.Enabled = true;
        }

        protected override void OnStop()
        {
            WriteToFile("Service is stopped at " + DateTime.Now);
        }
        public void WriteToFile(string Message)
        {
            string path = AppDomain.CurrentDomain.BaseDirectory + "\\Logs";
            if (!Directory.Exists(path))
            {
                Directory.CreateDirectory(path);
            }
            string filepath = AppDomain.CurrentDomain.BaseDirectory + "\\Logs\\ServiceLog_" + DateTime.Now.Date.ToShortDateString().Replace('/', '_') + ".txt";
            if (!System.IO.File.Exists(filepath))
            {
                // Create a file to write to.   
                using (StreamWriter sw = System.IO.File.CreateText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
            else
            {
                using (StreamWriter sw = System.IO.File.AppendText(filepath))
                {
                    sw.WriteLine(Message);
                }
            }
        }
        private void OnElapsedTime(object source, ElapsedEventArgs e)
        {
            WriteToFile("Service is recall at " + DateTime.Now);

            //get event on sharepoint
            StartReminderService(coreService);
        }
        public static void sendMailToUserNotOrder(ClientContext clientContext, IEnumerable<UserNotOrderMailInfo> users, string emailTemplateJson)
        {
            try
            {
                var jsonTemplate = ReadEmailJsonTemplate(emailTemplateJson);
                var templateBody = jsonTemplate.TryGetValue("Body", out object body);
                ReadEmailTemplate(body.ToString());
                var templateSubject = jsonTemplate.TryGetValue("Subject", out object subject);
                var emailp = new EmailProperties();
                string hostname = "https://localhost:4200/";
                var noReplyEmail = ConfigurationSettings.AppSettings["noReplyEmail"];
                foreach (var user in users)
                {
                    emailp.To = new List<string>() { user.UserMail };
                    emailp.From = noReplyEmail;
                    emailp.Body = String.Format(emailTemplate.Html.ToString(),
                        user.EventTitle,
                        user.EventRestaurant,
                        user.UserMail.ToString(),
                        hostname + "make-order/" + user.OrderId);
                    emailp.Subject = subject.ToString();

                    //Utility.SendEmail(clientContext, emailp);
                    WriteFile.WriteToFile("User not order" + DateTime.Now);
                    clientContext.ExecuteQuery();
                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }
        private static Dictionary<string, object> ReadEmailJsonTemplate(string json)
        {
            return JsonConvert.DeserializeObject<Dictionary<string, object>>(json);
        }
        public static void ReadEmailTemplate(string html)
        {
            emailTemplate = JsonConvert.DeserializeObject<EmailTemplate>(html);
        }
        public static void StartReminderService(FosCoreService coreService)
        {

            var timeToCheckMax = "2019-09-17T10:54:00";
            var timeToCheckMin = "2019-09-17T10:52:00";

            DateTime aDate = DateTime.Now;


            DateTime timeCheckMax = aDate.AddMinutes(1);
            DateTime timeCheckMin = aDate.AddMinutes(-1);

            var timeMax = timeCheckMax.ToString("yyyy-MM-ddTHH:mm:ss");
            var timeMin = timeCheckMin.ToString("yyyy-MM-ddTHH:mm:ss");

            //var dateToCheck = aDate.ToString("yyyy-MM-ddTHH:mm:ss");
            var clientContext = coreService.GetClientContext();
            var web = clientContext.Web;
            var list = web.Lists.GetByTitle(EventConstant.EventList);
            CamlQuery getAllEventOpened = new CamlQuery();
            getAllEventOpened.ViewXml =
                @"<View>
                        <Query>
                            <Where>
                                    <And>
                                        <And> +
                                        <Gt>" +
                                            "<FieldRef Name='" + EventConstant.EventTimeToReminder + "'/>" +
                                            "<Value Type='DateTime'  IncludeTimeValue='TRUE'>" + timeMin + "</Value>" +
                                        @"</Gt> +
                                        <Lt>" +
                                            "<FieldRef Name='" + EventConstant.EventTimeToReminder + "'/>" +
                                            "<Value Type='DateTime'  IncludeTimeValue='TRUE'>" + timeMax + "</Value>" +
                                        @"</Lt> +
                                    
                                        </And> +
                                        <And>
                                            <Eq>" +
                                                "<FieldRef Name='" + EventConstant.EventStatus + "'/>" +
                                                "<Value Type='Text'>" + EventStatus.Opened + "</Value>" +
                                            @"</Eq> +
                                            <Eq>" +
                                                "<FieldRef Name='" + EventConstant.EventIsReminder + "'/>" +
                                                "<Value Type='Text'>" + EventIsReminder.No + "</Value>" +
                                            @"</Eq> +
                                        </And>
                                     </And>
                            </Where>
                        </Query>
                        <RowLimit>1000</RowLimit>
                    </View>";

            var events = list.GetItems(getAllEventOpened);
            clientContext.Load(events);
            clientContext.ExecuteQuery();

            WriteFile.WriteToFile("Number of event find: " + events.Count.ToString());

            WriteFile.WriteToFile("--------------------------------------------");
            if (events.Count > 0)
            {
                List<Model.Dto.UserNotOrderMailInfo> lstUserNotOrder = new List<Model.Dto.UserNotOrderMailInfo>();

                foreach (var element in events)
                {
                    var eventTite = element[EventConstant.EventTitle].ToString();
                    var closeTimeString = element[EventConstant.EventTimeToClose].ToString();
                    var closeTime = DateTime.Parse(closeTimeString).ToLocalTime();
                    var eventRestaurant = element[EventConstant.EventRestaurant].ToString();
                    Console.WriteLine(eventTite);
                    var eventId = element[EventConstant.ID].ToString();
                    var userNotOrder = coreService.GetEventToReminder(eventId);
                    WriteFile.WriteToFile("Event find: " + eventTite.ToString());
                    foreach (var user in userNotOrder)
                    {
                        Model.Dto.UserNotOrderMailInfo userNew = new Model.Dto.UserNotOrderMailInfo();
                        userNew.EventRestaurant = eventRestaurant;
                        userNew.EventTitle = eventTite;
                        userNew.OrderId = user.OrderId;
                        userNew.UserMail = user.UserEmail;
                        lstUserNotOrder.Add(userNew);
                        WriteFile.WriteToFile("User not order: " + userNew.UserMail + DateTime.Now);
                    }

                }
                //send mail

                //string path = AppDomain.CurrentDomain.BaseDirectory + EventConstant.ReminderEventEmailTemplate;
                //string emailTemplateJson = System.IO.File.ReadAllText(path);
                //sendMailToUserNotOrder(clientContext, lstUserNotOrder, emailTemplateJson);
            }
        }
    }
}
