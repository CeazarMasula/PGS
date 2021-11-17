import R from "ramda";
import {
  BinaryQueryOperatorInput,
  StringQueryOperatorInput,
} from "./convert-mongoose";

function escape(value: string) {
  return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
function clean(obj) {
    for (const propName in obj) {
      if (obj[propName] === []) {
        delete obj[propName];
      }
    }
    return obj
  }
export function convertToMongooseQuery(queryOperator: {
  id: BinaryQueryOperatorInput;
  name: StringQueryOperatorInput;
}) {

  return R.compose<any, any, any, any, any>(
    R.fromPairs,
    R.filter<any>(R.identity),
    R.map(([key,value]) => {
        R.map((info)=>{
            console.log("HAYY",info)
        })(value)

      if (key === "startsWith") {
        console.log("1");
        const regex = new RegExp(`^${escape(value)}.*$`, "i");
        return ["$regex", regex];
      }

      if (key === "contains") {
        console.log("2");
        const regex = new RegExp(`^.*${escape(value)}.*$`, "i");
        return ["$regex", regex];
      }
      
      console.log("3");

      //   return [`$${key}`, value];
      //   else{
      //     // const regex = new RegExp(`^.*${escape(value)}.*$`, "i");

      //       console.log(value)
      //       console.log("WTF",["$"+key])
      //     return ["$"+value]
      //   }
    }),
    R.toPairs
  )(queryOperator);
}
