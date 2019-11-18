﻿using Newtonsoft.Json;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace easyres_api.Model
{
    public class Restaurant
    {
        [Key]
        public int RestaurantId { get; set; }
        public string Naam { get; set; }
        [Required]
        public Adres Locatie { get; set; }
        [Required]
        public Menu Menu { get; set; }
        public Openingsuren Openingsuren { get; set; }
        public string Beschrijving { get; set; }
        public string LogoImage { get; set; }
        public string Type { get; set; }
        public string Soort { get; set; }
        public string Gerechten { get; set; }
        public bool IsAdvertentie { get; set; }
        [JsonIgnore]
        public List<Reservatie> Reservaties { get; set; }
        [JsonIgnore]
        public List<Bestelling> Bestellingen { get; set; }
        [JsonIgnore]
        public List<Sessie> Sessies { get; set; }
    }
}
