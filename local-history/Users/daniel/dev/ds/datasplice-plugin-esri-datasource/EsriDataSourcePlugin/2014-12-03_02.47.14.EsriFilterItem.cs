using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using DataSplice.Data;

namespace DataSplice.EsriDataSource
{
	/// <summary>
	/// Wraps a DataSplice.Data.IFilterItem and converts it to ESRI-specific querying formats. For example:
	/// 
	/// <code>?where=1%3D1&geometry=%7B%22ymin%22%3A%2232.161%22%2C%22ymax%22%3A%2232.170%22%2C%22xmin%22%3A%22-110.893%22%2C%22xmax%22%3A%22-110.960%22%7D&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson</code>
	/// 
	/// This querystring can then be appended to a base uri and layer ID to query a given layer:
	/// 
	/// <code>http://10.255.255.20:6080/arcgis/rest/services/DEMOGIS/VegMan/MapServer/0/query?where=1%3D1&text=&objectIds=&time=&geometry=%7B%22ymin%22%3A%2232.161%22%2C%22ymax%22%3A%2232.170%22%2C%22xmin%22%3A%22-110.893%22%2C%22xmax%22%3A%22-110.960%22%7D&geometryType=esriGeometryEnvelope&inSR=4326&spatialRel=esriSpatialRelIntersects&relationParam=&outFields=*&returnGeometry=true&maxAllowableOffset=&geometryPrecision=&outSR=&returnIdsOnly=false&returnCountOnly=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&returnZ=false&returnM=false&gdbVersion=&returnDistinctValues=false&f=pjson</code>
	/// </summary>
	public class EsriFilterItem
	{
		private readonly IFilterItem filterItem;

		public string West { get; private set; }
		public string East { get; private set; }
		public string North { get; private set; }
		public string South { get; private set; }
		
		/// <summary>
		/// Creates a new EsriFilterItem.
		/// </summary>
		/// <param name="filterItem"></param>
		public EsriFilterItem(IFilterItem filterItem)
		{
			this.filterItem = filterItem;
			if (filterItem != null)
			{
				Parse(this.filterItem);
			}
		}

		public override string ToString()
		{
			// Don't build a box unless we have all four corners
			if (West == null || East == null || North == null || South == null)
			{
				return "";
			}

			// Build geometry
			StringBuilder geometryBuilder = new StringBuilder()
				.AppendFormat("{0}:{1}", "xmax", West)
				.AppendFormat(",{0}:{1}", "ymax", South)
				.AppendFormat(",{0}:{1}", "xmin", North)
				.AppendFormat(",{0}:{1}", "ymin", East);
			string urlEncodedGeometry = HttpUtility.UrlEncode(String.Format("{{{0}}}", geometryBuilder.ToString()));

			// Build querystring
			StringBuilder queryStringBuilder = new StringBuilder().AppendFormat("{0}={1}", "geometry", urlEncodedGeometry);
			return queryStringBuilder.ToString();
		}

		/// <summary>
		/// Loops through the IFilterItem tree looking for geometry args.
		/// </summary>
		/// <param name="filterItem"></param>
		private void Parse(IFilterItem filterItem)
		{
			for (int i = 0; i < filterItem.ArgumentCount; i++)
			{
				object candidate = filterItem.GetArgument(i);
				if (candidate is IFilterItem)
				{
					// Recurse
					Parse(candidate as IFilterItem);
				}
				else if (candidate is string)
				{
					// If the name is any of our labels, then the next arg
					// are the coordinates for that name.
					string name = candidate as string;
					switch (name)
					{
						case "X Max":
							West = filterItem.GetArgument(++i).ToString();
							break;
						case "Y Max":
							East = filterItem.GetArgument(++i).ToString(); ;
							break;
						case "X Min":
							North = filterItem.GetArgument(++i).ToString(); ;
							break;
						case "Y Min":
							South = filterItem.GetArgument(++i).ToString(); ;
							break;
						default:
							break;
					}

					// Stop searching if we have all the coordinates.
					if (West != null && East != null && North != null && South != null)
					{
						break;
					}
				}
			}
		}
	}
}
