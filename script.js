let latitude = 52.2021950;
let longitude = 0.1282028;

const params = new Proxy(new URLSearchParams(window.location.search), {
  get: (searchParams, prop) => searchParams.get(prop),
});

let reactiveContent="";
if (params.d !== null) {
	reactiveContent=decompress(params.d);
}

let app1=Vue.createApp({
		data() {
          return {
			mode: 0,
			geodataList: [],
			radius: 0,
			modes: ["Move","Point","Line","Circle","Polygon"],
			adviceMessages: ["Move the map without drawing anything","Click on the map to mark a point","Draw a line between the last two clicked points; click the icon again to restart","Click on the map to set the centre; choose the radius; click on the map again to change the centre; click the icon again to restart","Click the map at each vertex of the polygon for 3 or more points; click the icon again to restart"],
			reactiveContent: reactiveContent
          }
		},
	methods : {
		copydata : function() {
			var promise = navigator.clipboard.writeText(""+this.reactiveContent+"");
		},

		copylink : function() {
			var promise = navigator.clipboard.writeText(""+this.directLink+"");
		},
	
		setMode : function(mode) {
			this.mode=mode;
			this.geodataList=[];
			this.latitude = null;
			this.longitude = null;
		},
		recalcGeoData : function(evt) {
		    this.radius=evt.target.value;
		    let t = JSON.parse(this.reactiveContent);
		    if (t.hasOwnProperty("circle")) {
		        let c=t.circle;
		        let el=c.split(/[ ]+/);
		        el[2]=evt.target.value;
		        t.circle=el.join(" ");
		        this.reactiveContent=JSON.stringify(t);
		    }
		},
		doDemo : function(demo) {
		    if (demo==1) {
		        this.geodataList = ["52.2021998 0.1281976"];
		        this.mode=1; // draw a point
		        this.reactiveContent = this.geoData();
		        icons.switchMode(1);
		        
		    }
		    if (demo==2) {
		        this.geodataList=["52.2058894 0.1250752","52.2056134 0.1234337"];
		        this.mode=2; // draw a line
		        this.reactiveContent = this.geoData();
		        icons.switchMode(2);
		        
		    }
		    if (demo==3) {
		        this.radius=15;
		        this.geodataList=["52.2054158 0.1222611"];
		        this.mode=3; // draw a circle
		        this.reactiveContent = this.geoData();
		        icons.switchMode(3);
		    }
		    if (demo==4) {
		        this.geodataList=["52.1999618 0.1279515","52.2011323 0.1296252","52.2025263 0.1309770","52.2040780 0.1273292","52.2029997 0.1262993","52.2025263 0.1262993","52.2018819 0.1253337","52.2012638 0.1259559","52.1999618 0.1279515"];
		        this.mode=4;
		        this.reactiveContent = this.geoData();
		        icons.switchMode(4);
		    }
		},

		geoData : function() {
			rv="";
			if (this.mode == 1) {
				if ((this.latitude !== null) && (this.longitude !== null)) {
					rv= JSON.stringify({"@type":"GeoCoordinates","point":this.latitude+" "+this.longitude},null,2);
				}
				recentreMap(this.latitude,this.longitude,18);
				drawPointFromString(this.latitude+" "+this.longitude);
			}

			if (this.mode == 2) {
				let c=this.geodataList;
				let start = c.at(-2);
				let end=c.at(-1);
				if (this.geodataList.length > 1) {
				rv=JSON.stringify({"@type":"GeoShape","line":start+"  "+end},null,2);
				recentreMap3(this.geodataList.slice(-2));
				drawLineFromString(start+" "+end);
				}
			}


			if (this.mode == 3) {
				let c=this.geodataList;
				let centre=c.at(-1);
				if (this.geodataList.length > 0) {
				rv=JSON.stringify({"@type":"GeoShape","circle":centre+" "+this.radius.toString()},null,2);
				recentreMap4(this.geodataList.at(-1),this.radius);
				drawCircleFromString(centre+" "+this.radius.toString());
				}
			}
			
			
			if (this.mode == 4) {
				let c=this.geodataList;
				let d=c[0];
				if (c.length > 2) {
					rv=JSON.stringify({"@type":"GeoShape","polygon":c.join(" ")+" "+d},null,2);
				    recentreMap3(this.geodataList);
				    drawPolygon(c.join(" ")+" "+d);
				}
			}
			
			
			return rv;
		}
	},
	computed : {
		directLink : function() {
			let rv="";
			if (this.reactiveContent !== "" ) {
				rv=compress(""+this.reactiveContent+"");
			}
			return rv;
		},
	
	
	    latitude : function() {
	        let rv="";
	        if (this.geodataList.length > 0) {
    	        let latest = this.geodataList.at(-1);
                let el=latest.split(/[ ]+/); 
                rv=el[0];
	        }
	        return rv;
	    },
	    longitude : function() {
	        let rv="";
	        if (this.geodataList.length > 0) {
    	        let latest = this.geodataList.at(-1);
                let el=latest.split(/[ ]+/); 
                rv=el[1];
	        }
	        return rv;
	    },
	    pointStr : function() {
	      let rv="";
	      if (this.reactiveContent !== "") {
	          let d=JSON.parse(this.reactiveContent);
	          if (d.hasOwnProperty("point")) {
	              rv=d.point;
	              let el=d.point.split(/[ ]+/);
	              this.mode=1;
	              recentreMap(parseFloat(el[0]), parseFloat(el[1]),18);
	              drawPointFromString(d.point);
	          }
	      }
	      return rv;
	    },
	    lineStr : function() {
	      let rv="";
	      if (this.reactiveContent !== "") {
	          let d=JSON.parse(this.reactiveContent);
	          if (d.hasOwnProperty("line")) {
	              rv=d.line;
                  let el=d.line.split(/[ ]+/);
	              let str1=el[0]+" "+el[1];
	              let str2=el[2]+" "+el[3];	
	              this.geodataList=[str1,str2];
	              this.mode=2;
	              recentreMap3(this.geodataList);
	              drawLineFromString(d.line);
	          }
	      }
	      return rv;
	    },
	    circleStr : function() {
	      let rv="";
	      if (this.reactiveContent !== "") {
	          let d=JSON.parse(this.reactiveContent);
	          if (d.hasOwnProperty("circle")) {
	              rv=d.circle;
	              let el=d.circle.split(/[ ]+/);
	              this.mode=3;
	              recentreMap4(el[0]+" "+el[1],el[2]);
	              this.radius=el[2];
	              drawCircleFromString(d.circle);
	          }
	      }
	      return rv;
	    },
	    polygonStr : function() {
	      let rv="";
	      if (this.reactiveContent !== "") {
	          let d=JSON.parse(this.reactiveContent);
	          if (d.hasOwnProperty("polygon")) {
	              rv=d.polygon;
	              let arr = d.polygon.split(/[ ]+/);
	              let gdl=[];
	              for (let i=0; i<arr.length-1; i+=2) {
	                  gdl.push(arr[i]+" "+arr[1+i]);
	              }
	              this.mode=4;
	              recentreMap3(gdl);
	              drawPolygon(d.polygon);
	          }
	      }
	      return rv;
	    },
	    
		geodataLog: function() {
			return this.geodataList.join("\n");
		},
		modeDesc : function() {
			return this.modes[this.mode];
		},
		advice : function() {
			return this.adviceMessages[this.mode];
		}

	}		
}).mount("#app1");

let icons=Vue.createApp({
		data() {
			return {
				mode: 0,
				app1: app1,
				dummy: 0
			}
		},
		methods : {
			switchMode : function(mode) {
				this.mode=mode;
			},
			setMode : function(mode) {
				this.mode=mode;
				app1.geodataList = [];
				this.dummy=clearMapMarkers();
				app1.reactiveContent="";
				app1.setMode(mode);
			},
			doDemo: function(demo) {
			    app1.doDemo(demo);
			}
		}
}).mount("#icons");


var map = L.map('map').setView([52.20220197878701, 0.1281988620758057], 18);

L.tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

var xlng = 0.0000064;
var xlat = 0.0000050;
let mapMarkers=[];

function to7decimalplaces(val) {
	if (val > 0) {
		return Math.floor(1e7*val+0.4999999999)/1e7
	} else {
		return Math.ceil(1e7*val-0.4999999999)/1e7
	}
}

function clearMapMarkers() {
    for(let i = 0; i < mapMarkers.length; i++){
    map.removeLayer(mapMarkers[i]);
    }
    return mapMarkers.length;
}

function recentreMap(lat,lon,zoom) {
    map.setView(new L.LatLng(lat, lon), zoom);
}


function recentreMap3(arr) {
    let maxLat=-91;
    let minLat=91;
    let minLon=361;
    let maxLon=-361;
    let sumLat=0;
    let sumLon=0;
    let count=0;
    for (let i=0; i<arr.length; i++) {
        let el=arr[i].split(/[ ]+/);
        let lat=parseFloat(el[0]);
        let lon=parseFloat(el[1]);
            sumLat+=lat;
            sumLon+=lon;
            if (lat > maxLat) { maxLat = lat }
            if (lat < minLat) { minLat = lat }
            if (lon > maxLon) { maxLon = lon }
            if (lon < minLon) { minLon = lon }
            count++;
    }
    let centrePoint = new L.LatLng(parseFloat(sumLat/count), parseFloat(sumLon/count));
    let deltaLat=(maxLat-minLat)/2;
    let deltaLon=(maxLon-minLon)/2;
    
    let zoom1=(18-2.7*Math.log(deltaLat / 0.0001430057703)/Math.log(10));
    let zoom2=(18-2.7*Math.log(deltaLon / 0.000227988)/Math.log(10));
    let zoom=Math.floor(Math.max(zoom1,zoom2));
        if (zoom > 18) { zoom = 18 };
        if (zoom < 0) { zoom = 0 };
    map.setView (centrePoint,zoom = zoom);
}

function recentreMap4(pointString, radius) {
        let el=pointString.split(/[ ]+/);  
        let centrePoint = new L.LatLng(parseFloat(el[0]),parseFloat(el[1]));
        let zoom = Math.floor(21 - 2.7*Math.log(radius)/Math.log(10)) ;
        if (zoom > 18) { zoom = 18 };
        if (zoom < 0) { zoom = 0 };
        map.setView (centrePoint,zoom = zoom);
}

function drawCircleFromString(str) {
       let el=str.split(/[ ]+/);  
       // still need TODO validation checks
    clearMapMarkers();
    c = new L.circle([parseFloat(el[0]),parseFloat(el[1])], {radius: parseFloat(el[2])});
    c.addTo(map);
    mapMarkers.push(c);
}

function drawPointFromString(str) {
       let el=str.split(/[ ]+/);  
       // still need TODO validation checks
    clearMapMarkers();
    c = new L.circle([parseFloat(el[0]),parseFloat(el[1])], {radius: 0});
    c.addTo(map);
    mapMarkers.push(c);
}

function drawLineFromString(str) {
    clearMapMarkers();
    let el=str.split(/[ ]+/);
       let lat1=parseFloat(el[0]);
       let lon1=parseFloat(el[1]);
       let lat2=parseFloat(el[2]);
       let lon2=parseFloat(el[3]);
       let latMid=(lat1+lat2)/2;
       let lonMid=(lon1+lon2)/2;

      let pointA = new L.LatLng(lat1, lon1);
      let pointB = new L.LatLng(lat2, lon2);    
      let pointList = [pointA, pointB];

      let line = new L.Polyline(pointList, {
        color: 'red',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
      });
      line.addTo(map);
      mapMarkers.push(line);
}    
    


function drawPolygon(polygonstring) {
    clearMapMarkers();
    
    // Zoom = floor(18 - 13/4* log(latDelta / 0.0001430057703)
    
        let coords=polygonstring.split(/[ ]+/);
        let pointList=[];
        let sumLat=0;
        let sumLon=0;
        let maxLat=-91;
        let minLat=91;
        let minLon=361;
        let maxLon=-361;
        
        let count=0;
        for (let i=0; i< coords.length/2; i++) {
            let lat=parseFloat(coords[i*2]);
            let lon=parseFloat(coords[1+i*2]);
            sumLat+=lat;
            sumLon+=lon;
            if (lat > maxLat) { maxLat = lat }
            if (lat < minLat) { minLat = lat }
            if (lon > maxLon) { maxLon = lon }
            if (lon < minLon) { minLon = lon }
            count++;
            let point= new L.LatLng(lat,lon);
            pointList.push(point);            
        }
        let deltaLat=(maxLat-minLat)/2;
        let deltaLon=(maxLon-minLon)/2;
        let zoom1=(18-(13/4)*Math.log(deltaLat / 0.0001430057703)/Math.log(10));
        let zoom2=(18-(13/4)*Math.log(deltaLon / 0.000227988)/Math.log(10));
        let zoom=Math.floor(Math.max(zoom1,zoom2));
        let meanLat=sumLat/count;
        let meanLon=sumLon/count;
       let polygon = new L.Polyline(pointList, {
        color: 'green',
        weight: 3,
        opacity: 0.5,
        smoothFactor: 1
      });
      polygon.addTo(map);
      mapMarkers.push(polygon);
}



function comp(u){
	let alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	let v=u.replace(/\s+/g,"f").replace(/[+]/g,"a").replace(/[-]/g,"b").replace(/[,]/g,"c").replace(/\./g,"d");	
	if (((v.length)%3) > 0) {
		v+="e".repeat(3-((v.length)%3));
	}
	let l=v.length;
	let o="";
	for (let i=0; i<l/3; i++) {
		let w=v.substr(3*i,3);
		let b=parseInt(w,16).toString(2);
		b="0".repeat(12-b.length)+b;
		o+=alphabet.charAt(parseInt(b.substr(0,6),2))+alphabet.charAt(parseInt(b.substr(6,6),2));
	}
	return o;
}

function decomp(c) {
	let alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";
	let o="";
	for (let i=0; i<c.length; i+=2) {
		let r=leftpad(alphabet.indexOf(c.charAt(i)).toString(2),6,"0")+leftpad(alphabet.indexOf(c.charAt(1+i)).toString(2),6,"0");
		o+=parseInt(r.substr(0,4),2).toString(16)+parseInt(r.substr(4,4),2).toString(16)+parseInt(r.substr(8,4),2).toString(16);	
	}

let w=o.replace(/f/g," ").replace(/a/g,"+").replace(/b/g,"-").replace(/c/g,",").replace(/d/g,".").replace(/e$/,"");
return w;
}


function leftpad(value, length, c) {
	if (value.length < length) {
		return "0".repeat(6-((value.length)%6))+value;
	} else {
		return value;
	}
}

function compress(jsonString) {
	let json=JSON.parse(jsonString);
	let rv="";
	if (json.hasOwnProperty("polygon")) { rv= "p"+comp(json.polygon); }
	if (json.hasOwnProperty("line")) { rv= "l"+comp(json.line); }
	if (json.hasOwnProperty("circle")) { rv= "c"+comp(json.circle); }
	if (json.hasOwnProperty("point")) { rv= "x"+comp(json.point); }	
	return rv;
}

function decompress(base64) {
	let i=base64.charAt(0);
	let remainder=base64.substr(1);
	let rv={"@type":"GeoShape"};
	if (i=="p") {rv.polygon=decomp(remainder); } 
	if (i=="l") {rv.line=decomp(remainder); }
	if (i=="c") {rv.circle=decomp(remainder); }
	if (i=="x") {rv['@type']="GeoCoordinates"; rv.point=decomp(remainder); }
	return JSON.stringify(rv,null,2);
}


map.on('click', function(e) {
  var c;
  
  if ((app1.mode >= 1) && (app1.mode <=4)) {
		        app1.geodataList.push(to7decimalplaces(e.latlng.lat)+" "+to7decimalplaces(e.latlng.lng));
		        app1.reactiveContent = app1.geoData();
  }

});


