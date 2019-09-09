﻿using FOS.Model.Domain.NowModel;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FOS.Model.Domain
{
    public class Order
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public int IdUser { get; set; }
        public Dictionary<Food, Dictionary<string, string>> FoodDetail { get; set; }

    }
}
