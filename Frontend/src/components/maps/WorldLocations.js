export default class WorldLocations {
    static locations = [];
    static capitals = [];
    static cities = [];
  
    // get location of cities and capitals
    static getAll() {
      if (this.locations.length === 0) this.init();
      return this.locations;
    }
  
    // get location of cities
    static getCities() {
      if (this.cities.length === 0) this.init();
      return this.cities;
    }
  
    // get location of capitals
    static getCapitals() {
      if (this.capitals.length === 0) this.init();
      return this.capitals;
    }
  
    static init() {
      this.locations = [
        {
          cap: false,
          pop: 0.468,
          lat: 68.9635467529297,
          lon: 33.0860404968262,
          country: "Russia",
          name: "Murmansk",
        },
        {
          cap: false,
          pop: 0.416,
          lat: 64.5206680297852,
          lon: 40.6461601257324,
          country: "Russia",
          name: "Arkhangelsk",
        },
        {
          cap: false,
          pop: 5.825,
          lat: 59.9518890380859,
          lon: 30.4533271789551,
          country: "Russia",
          name: "Saint Petersburg",
        },
        {
          cap: false,
          pop: 0.152,
          lat: 59.5709991455078,
          lon: 150.780014038086,
          country: "Russia",
          name: "Magadan",
        },
        {
          cap: false,
          pop: 1.16,
          lat: 58.0002365112305,
          lon: 56.2324638366699,
          country: "Russia",
          name: "Perm'",
        },
      ];
  
      this.capitals = this.locations.filter((city) => city.cap);
      this.cities = this.locations.filter((city) => !city.cap);
      return this.locations;
    }
  }
  