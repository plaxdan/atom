using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.IO;
using System.Web.Script.Serialization;

using DataSplice.EsriDataSource;
using DataSplice.Data;
using System.Web;

namespace DataSplice.EsriDataSource
{
	public class EsriService : IEsriService
	{
		/// <summary>
		/// Returns a list of name and id for all layers of a given ESRI MapService
		/// or FeatureService.
		/// </summary>
		/// <param name="serviceAddress">REST service address.</param>
		/// <returns>Name and ID of each layer exposed by the REST service.</returns>
		public List<LayerInfo> GetServiceLayers(string serviceAddress)
		{
			string jsonServiceAddress = serviceAddress + "?f=json";
			List<LayerInfo> list = null;

			var request = (HttpWebRequest)WebRequest.Create(jsonServiceAddress);
			var response = request.GetResponse();
			using (var stream = response.GetResponseStream())
			{
				var reader = new StreamReader(stream);
				string json = reader.ReadToEnd();
				list = GeoJsonUtils.LayersForService(json);
			}
			return list;
		}

		/// <summary>
		/// Provides the attribute information for a given layer.
		/// </summary>
		/// <param name="serviceAddress">REST service address</param>
		/// <param name="layerId">ID of the layer we're interested in.</param>
		/// <returns></returns>
		public List<AttributeInfo> GetFeatureAttributes(string serviceAddress, int layerId)
		{
			List<AttributeInfo> list = null;
			var targetServiceAddress = serviceAddress.EndsWith("/") ? serviceAddress : serviceAddress + "/";
			var endPoint = String.Format("{0}{1}?f=json", targetServiceAddress, layerId);
			var request = (HttpWebRequest)WebRequest.Create(endPoint);
			var response = request.GetResponse();
			using (var stream = response.GetResponseStream())
			{
				var reader = new StreamReader(stream);
				string json = reader.ReadToEnd();
				list = GeoJsonUtils.AttributesForLayer(json);
			}

			return list;
		}
	}
}
