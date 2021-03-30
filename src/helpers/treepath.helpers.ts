import { Schema } from "mongoose";
import streamWorker from "stream-worker";
import _orderBy from "lodash/orderBy";
type SchemaTypes = {
  onDelete?: string;
  idType?: string | Schema.Types.ObjectId;
  pathSeparator?: string;
};

type AddTypes = {
  parent: Object;
  path: Object;
  children: [];
};
class MpathUtil {
  getLevelByPathAndSeparator(path, separator) {
    return path ? path.split(separator).length : 1;
  }

  mongoSortToLodashSort(mongoSortObj) {
    const lodashSortObj = {
      keys: [],
      orders: [],
    };

    for (let key in mongoSortObj) {
      if (mongoSortObj.hasOwnProperty(key)) {
        let sortOrder = mongoSortObj[key] === -1 ? "desc" : "asc";
        lodashSortObj.keys.push(key);
        lodashSortObj.orders.push(sortOrder);
      }
    }

    return lodashSortObj;
  }
  listToTree(list, sort) {
    let nodeMap = {};
    let currentNode;
    let rootNodes = [];
    let index;
    let lodashSort = this.mongoSortToLodashSort(sort);
    const shouldSort = lodashSort.keys.length > 0;

    for (index = 0; index < list.length; index += 1) {
      currentNode = list[index];
      currentNode.children = [];
      nodeMap[currentNode._id] = index;

      const hasParentInMap = nodeMap.hasOwnProperty(currentNode.parent);

      if (hasParentInMap) {
        list[nodeMap[currentNode.parent]].children.push(currentNode);

        if (shouldSort) {
          list[nodeMap[currentNode.parent]].children = _orderBy(
            list[nodeMap[currentNode.parent]].children,
            lodashSort.keys,
            lodashSort.orders
          );
        }
      } else {
        rootNodes.push(currentNode);
      }
    }

    if (shouldSort) {
      rootNodes = _orderBy(rootNodes, lodashSort.keys, lodashSort.orders);
    }

    return rootNodes;
  }
}
export default (schema: Schema, options: SchemaTypes) => {
  const onDelete = (options && options.onDelete) || "REPARENT"; // or 'DELETE'
  const idType = (options && options.idType) || Schema.Types.ObjectId;
  const pathSeparator = (options && options.pathSeparator) || "#";
  const pathSeparatorRegex = "[" + pathSeparator + "]";
  var mpathUtil = new MpathUtil();

  const streamWorkerOptions = {
    promises: false,
    concurrency: 5,
  };
  const addSchema = {
    parent: {
      index: true,
      set: (value) =>
        value instanceof Object && value._id ? value._id : value,
      type: idType,
    },
    path: {
      index: true,
      type: String,
    },
    children: [],
  } as AddTypes;
  schema.add(addSchema);
  schema.pre("save", function preSave(next) {
    const hasModifiedParent = this.isModified("parent");
    const pathUpdateIsRequired = this.isNew || hasModifiedParent;

    if (!pathUpdateIsRequired) {
      return next();
    }
    
    const self = this;

    const updateChildPaths = (pathToReplace, replacementPath) => {
      const childConditions = {
        path: { $regex: "^" + pathToReplace + pathSeparatorRegex },
      };

      const childStream = self.collection.find(childConditions).stream();

      const onStreamData = (childDoc, done) => {
        const newChildPath =
          replacementPath + childDoc.path.substr(pathToReplace.length);

        self.collection
          .updateMany({ _id: childDoc._id }, { $set: { path: newChildPath } })
          .then(() => done());
      };

      const onStreamClose = (ex) => next(ex);

      streamWorker(
        childStream,
        onStreamData,
        streamWorkerOptions,
        onStreamClose
      );
    };

    const oldPath = self.path;

    if (this.parent) {
      this.collection
        .findOne({ _id: this.parent })
        .then((parentDoc) => {
          const newPath = parentDoc.path + pathSeparator + self._id.toString();
          self.path = newPath;

          if (hasModifiedParent) {
            // Rewrite child paths when parent is changed
            updateChildPaths(oldPath, newPath);
          } else {
            return next();
          }
        })
        .catch((ex) => next(ex));
    } else {
      const newPath = self._id.toString();
      self.path = newPath;

      if (hasModifiedParent) {
        updateChildPaths(oldPath, newPath);
      } else {
        return next();
      }
    }
  });
  schema.statics.getChildrenTree = function getChildrenTree(args) {
    const rootDoc = args && args.rootDoc ? args.rootDoc : null;
    let fields = args && args.fields ? args.fields : null;
    let filters = args && args.filters ? args.filters : {};
    let minLevel = args && args.minLevel ? args.minLevel : 1;
    let maxLevel = args && args.maxLevel ? args.maxLevel : 9999;
    let options = args && args.options ? args.options : {};
    let populateStr = args && args.populate ? args.populate : "";

    // filters
    if (rootDoc) {
      filters.path = { $regex: "^" + rootDoc.path + pathSeparator };
    }

    // fields
    // include 'path' and 'parent' if not already included
    if (fields) {
      if (fields instanceof Object) {
        if (!fields.hasOwnProperty("path")) {
          fields["path"] = 1;
        }
        if (!fields.hasOwnProperty("parent")) {
          fields["parent"] = 1;
        }
      } else {
        if (!fields.match(/path/)) {
          fields += " path";
        }
        if (!fields.match(/parent/)) {
          fields += " parent";
        }
      }
    }

    // options:sort
    // passed options.sort is applied after entries are fetched from database
    let postSortObj = {};

    if (options.sort) {
      postSortObj = options.sort;
    }

    options.sort = { path: 1 };

    return this.find(filters, fields, options)
      .populate(populateStr)
      .then((result) =>
        result.filter((node) => {
          const level = mpathUtil.getLevelByPathAndSeparator(
            node.path,
            pathSeparator
          );
          return level >= minLevel && level <= maxLevel;
        })
      )
      .then((result) => mpathUtil.listToTree(result, postSortObj))
      .catch((err) => console.error(err));
  };
  schema.methods.getChildrenTree = function (args){
    args.rootDoc = this;
    console.log("GetChildren", this);
    return [];
  };
};
