import { setRoute } from "egov-ui-framework/ui-redux/app/actions";
import {
  prepareFinalObject,
  toggleSnackbar
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import get from "lodash/get";
import set from "lodash/set";
import {
  creatreceiptnotes,
  getreceiptnotesSearchResults,
  getPriceListSearchResults,
  updatereceiptnotes
} from "../../../../../ui-utils/storecommonsapi";
import {
  convertDateToEpoch,
  epochToYmdDate,
  showHideAdhocPopup,
  validateFields
} from "../../utils";
import { getTenantId } from "egov-ui-kit/utils/localStorageUtils";
import { handleScreenConfigurationFieldChange as handleField } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import {  
  samplematerialsSearch,
  
  } from "../../../../../ui-utils/sampleResponses";
// SET ALL SIMPLE DATES IN YMD FORMAT
const setDateInYmdFormat = (obj, values) => {
  values.forEach(element => {
    set(obj, element, epochToYmdDate(get(obj, element)));
  });
};

// SET ALL MULTIPLE OBJECT DATES IN YMD FORMAT
const setAllDatesInYmdFormat = (obj, values) => {
  values.forEach(element => {
    let elemObject =
      get(obj, `${element.object}`, []) === null
        ? []
        : get(obj, `${element.object}`, []);
    for (let i = 0; i < elemObject.length; i++) {
      element.values.forEach(item => {
        set(
          obj,
          `${element.object}[${i}].${item}`,
          epochToYmdDate(get(obj, `${element.object}[${i}].${item}`))
        );
      });
    }
  });
};

// SET ALL MULTIPLE OBJECT EPOCH DATES YEARS
const setAllYears = (obj, values) => {
  values.forEach(element => {
    let elemObject =
      get(obj, `${element.object}`, []) === null
        ? []
        : get(obj, `${element.object}`, []);
    for (let i = 0; i < elemObject.length; i++) {
      element.values.forEach(item => {
        let ymd = epochToYmdDate(get(obj, `${element.object}[${i}].${item}`));
        let year = ymd ? ymd.substring(0, 4) : null;
        year && set(obj, `${element.object}[${i}].${item}`, year);
      });
    }
  });
};

const setRolesData = obj => {
  let roles = get(obj, "user.roles", []);
  let newRolesArray = [];
  roles.forEach(element => {
    newRolesArray.push({
      label: element.name,
      value: element.code
    });
  });
  set(obj, "user.roles", newRolesArray);
};

const returnEmptyArrayIfNull = value => {
  if (value === null || value === undefined) {
    return [];
  } else {
    return value;
  }
};

export const setRolesList = (state, dispatch) => {
  let rolesList = get(
    state.screenConfiguration.preparedFinalObject,
    `Employee[0].user.roles`,
    []
  );
  let furnishedRolesList = rolesList.map(item => {
    return " " + item.label;
  });
  dispatch(
    prepareFinalObject(
      "hrms.reviewScreen.furnishedRolesList",
      furnishedRolesList.join()
    )
  );
};

const setDeactivationDocuments = (state, dispatch) => {
  // GET THE DEACTIVATION DOCUMENTS FROM UPLOAD FILE COMPONENT
  let deactivationDocuments = get(
    state.screenConfiguration.preparedFinalObject,
    `deactivationDocuments`,
    []
  );
  // FORMAT THE NEW DOCUMENTS ARRAY ACCORDING TO THE REQUIRED STRUCTURE
  let addedDocuments = deactivationDocuments.map(document => {
    return {
      documentName: get(document, "fileName", ""),
      documentId: get(document, "fileStoreId", ""),
      referenceType: "DEACTIVATION"
    };
  });
  // GET THE PREVIOUS DOCUMENTS FROM EMPLOYEE OBJECT
  let documents = get(
    state.screenConfiguration.preparedFinalObject,
    `Employee[0].documents`,
    []
  );
  // ADD THE NEW DOCUMENTS TO PREVIOUS DOCUMENTS
  documents = [...documents, ...addedDocuments];
  // SAVE THE DOCUMENTS BACK TO EMPLOYEE
  dispatch(prepareFinalObject("Employee[0].documents", documents));
};

// Remove objects from Arrays not having the specified key (eg. "id")
// and add the key-value isActive:false in those objects having the key
// so as to deactivate them after the API call
const handleDeletedCards = (jsonObject, jsonPath, key) => {
  let originalArray = get(jsonObject, jsonPath, []);
  let modifiedArray = originalArray.filter(element => {
    return element.hasOwnProperty(key) || !element.hasOwnProperty("isDeleted");
  });
  modifiedArray = modifiedArray.map(element => {
    if (element.hasOwnProperty("isDeleted")) {
      element["isActive"] = false;
    }
    return element;
  });
  set(jsonObject, jsonPath, modifiedArray);
};

export const furnishindentData = (state, dispatch) => {
  let materialReceipt = get(
    state.screenConfiguration.preparedFinalObject,
    "materialReceipt",
    []
  );
   setDateInYmdFormat(materialReceipt[0], ["inspectionDate","receiptDate","challanDate", "supplierBillDate" ]);
  setAllDatesInYmdFormat(materialReceipt[0], [
   // { object: "indent.materialIssueDetails[0]", values: ["ManufacturerDate",] },
    { object: "receiptDetails", values: ["receiptDetailsAddnInfo[0].manufactureDate","receiptDetailsAddnInfo[0].expiryDate"] },
    
  ]);
  // setAllYears(materialReceipt[0], [
  //   { object: "education", values: ["yearOfPassing"] },
  //   { object: "tests", values: ["yearOfPassing"] }
  // ]);
  // setRolesData(materialReceipt[0]);
  // setRolesList(state, dispatch);
  dispatch(prepareFinalObject("materialReceipt", materialReceipt));
};

export const handleCreateUpdateMaterialReceipt = (state, dispatch) => {
  let id = get(
    state.screenConfiguration.preparedFinalObject,
    "materialReceipt[0].id",
    null
  );
  if (id) {
    
    createUpdateMR(state, dispatch, "UPDATE");
  } else {
    createUpdateMR(state, dispatch, "CREATE");
  }
};

export const createUpdateMR = async (state, dispatch, action) => {
  const pickedTenant = get(
    state.screenConfiguration.preparedFinalObject,
    "materialReceipt[0].tenantId"
  );
  const tenantId =  getTenantId();
  let queryObject = [
    {
      key: "tenantId",
      value: tenantId
    }
  ];
 
  let materialReceipt = get(
    state.screenConfiguration.preparedFinalObject,
    "materialReceipt",
    []
  );
  set(materialReceipt[0], "tenantId", tenantId);
  // get set date field into epoch

  let receiptDate =
  get(state, "screenConfiguration.preparedFinalObject.materialReceipt[0].receiptDate",0) 
  receiptDate = convertDateToEpoch(receiptDate);
  set(materialReceipt[0],"receiptDate", receiptDate);
  let supplierBillDate =
  get(state, "screenConfiguration.preparedFinalObject.materialReceipt[0].supplierBillDate",0) 
  supplierBillDate = convertDateToEpoch(supplierBillDate);
  set(materialReceipt[0],"supplierBillDate", supplierBillDate);
  let challanDate =
  get(state, "screenConfiguration.preparedFinalObject.materialReceipt[0].challanDate",0) 
  challanDate = convertDateToEpoch(challanDate);
  set(materialReceipt[0],"challanDate", challanDate);
  let inspectionDate =
  get(state, "screenConfiguration.preparedFinalObject.materialReceipt[0].inspectionDate",0) 
  inspectionDate = convertDateToEpoch(inspectionDate);
  set(materialReceipt[0],"inspectionDate", inspectionDate);


  // set date to epoch in  price list material name
  let receiptDetails = returnEmptyArrayIfNull(
    get(materialReceipt[0], "receiptDetails[0].receiptDetailsAddnInfo", [])
  );
  for (let i = 0; i < receiptDetails.length; i++) {
    set(
      materialReceipt[0],
      `receiptDetails[${i}].receiptDetailsAddnInfo[0].manufactureDate`,
      convertDateToEpoch(
        get(materialReceipt[0], `receiptDetails[${i}].receiptDetailsAddnInfo[0].manufactureDate`),
        "dayStart"
      )
    );
    set(
      materialReceipt[0],
      `receiptDetails[${i}].receiptDetailsAddnInfo[0].expiryDate`,
      convertDateToEpoch(
        get(materialReceipt[0], `receiptDetails[${i}].receiptDetailsAddnInfo[0].expiryDate`),
        "dayStart"
      )
    );
  }

  

  //set defailt value
  let id = get(
    state.screenConfiguration.preparedFinalObject,
    "materialReceipt[0].id",
    null
  );
  if(id === null)
  {
    // set(materialReceipt[0],"indentNumber", "");
    // set(materialReceipt[0],"indentType", "Indent");
    // set(materialReceipt[0],"materialHandOverTo", "Test");
    // set(materialReceipt[0],"designation", "");
  }
 
  



  if (action === "CREATE") {
    try {
      console.log(queryObject)
      console.log("queryObject")
      let response = await creatreceiptnotes(
        queryObject,        
        materialReceipt,
        dispatch
      );
      if(response){
        let mrnNumber = response.materialReceipt[0].mrnNumber
        dispatch(setRoute(`/egov-store-asset/acknowledgement?screen=MATERIALRECEIPT&mode=create&code=${mrnNumber}`));
       }
    } catch (error) {
      furnishindentData(state, dispatch);
    }
  } else if (action === "UPDATE") {
    try {
      let response = await updatereceiptnotes(
        queryObject,
        materialReceipt,
        dispatch
      );
      if(response){
        let mrnNumber = response.materialReceipt[0].mrnNumber
        dispatch(setRoute(`/egov-store-asset/acknowledgement?screen=MATERIALRECEIPT&mode=update&code=${mrnNumber}`));
       }
    } catch (error) {
      furnishindentData(state, dispatch);
    }
  }

};

export const getMaterialIndentData = async (
  state,
  dispatch,
  id,
  tenantId
) => {
  let queryObject = [
    {
      key: "ids",
      value: id
    },
    {
      key: "tenantId",
      value: tenantId
    }
  ];

 let response = await getreceiptnotesSearchResults(queryObject, dispatch);
// let response = samplematerialsSearch();
  dispatch(prepareFinalObject("materialReceipt", get(response, "MaterialReceipt")));
 
  furnishindentData(state, dispatch);
};
