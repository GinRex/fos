﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FOS.Model.Dto
{
    public class Order
    {
        public string Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string IdUser { get; set; }
        public string IdEvent { get; set; }
        public int IdRestaurant { get; set; }
        public int IdDelivery { get; set; }
        public List<FoodDetailJson> FoodDetail { get; set; }
        public int OrderStatus { get; set; }
        public string Email { get; set; }
    }
}
