﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace FOS.Model.Domain
{
    public class FavoriteRestaurant
    {
        public int ID { get; set; }
        public string UserId { get; set; }
        public string RestaurantId { get; set; }
    }
}
