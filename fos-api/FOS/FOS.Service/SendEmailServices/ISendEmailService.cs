﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FOS.Services.SendEmailServices
{
    public interface ISendEmailService
    {
        Task SendEmailAsync(string idEvent, string html);
        void SendReport(string userEmail, string html);
    }
}
