import {
    getCommonHeader,
    getLabel,
    getBreak,
    getCommonContainer
  } from "egov-ui-framework/ui-config/screens/specs/utils";
  import { estateApplicationAccountStatementGen } from './searchResource/estateApplicationAccountStatementGen';
  import { searchResultsAccountStatement } from './searchResource/searchResultsAccountStatement';
  import commonConfig from "config/common.js";
  import { prepareFinalObject } from "egov-ui-framework/ui-redux/screen-configuration/actions";
  import { httpRequest } from "../../../../ui-utils";
  import {downloadAccountStatementPdf,downloadAccountStatementXLS} from '../estate/searchResource/searchAccountStatementFunction'
  import {
    handleScreenConfigurationFieldChange as handleField
  } from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { ESTATE_SERVICES_MDMS_MODULE } from "../../../../ui-constants";
import {
  getSearchResults
} from "../../../../ui-utils/commons";
import {
  getQueryArg
} from "egov-ui-framework/ui-utils/commons";
import get from "lodash/get";
  
  const header = getCommonHeader({
    labelName: "Account Statement Generation",
    labelKey: "ES_ACCOUNT_STATEMENT_GENERATION_HEADER",
    fileNumber: {
      uiFramework: "custom-atoms-local",
      moduleName: "egov-estate",
      componentPath: "FileNumberContainer",
      props: {
        number: ""
      },
    }
  });
  

  const searchResults = async (action, state, dispatch, fileNumber) => {
    let queryObject = [
      { key: "fileNumber", value: fileNumber }
    ];
    dispatch(
      prepareFinalObject(
        "singleSubCategory",
        []
      )
    )
    let mdmsCategory = get(state.screenConfiguration.preparedFinalObject,"searchScreenMdmsData.EstateServices.categories")
    let singleSubCategory = get(state.screenConfiguration.preparedFinalObject,"singleSubCategory")
    let payload = await getSearchResults(queryObject);
    if (payload) {
      let properties = payload.Properties;
      let value;

      if(properties[0].subCategory === "SUBCAT.HOUSE"){
        value = "House"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.DWELLINGS"){
        value = "Dwellings"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.FLAT"){
        value = "Flat"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.SCF"){
        value = "SCF"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.SCO"){
        value = "SCO"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.BOOTH"){
        value = "Booth"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }
      else if(properties[0].subCategory === "SUBCAT.SHOP"){
        value = "Shop"
        dispatch(prepareFinalObject("singleSubCategory", value));
      }

      dispatch(prepareFinalObject("Properties", properties));
  
    }
  }

  const getMdmsData = async (dispatch) => {
    let mdmsBody = {
      MdmsCriteria: {
        tenantId: commonConfig.tenantId,
        moduleDetails: [{
          moduleName: ESTATE_SERVICES_MDMS_MODULE,
          masterDetails: [{
           name: "categories"
          }]
        }]
      }
    };
    try {
      let payload = await httpRequest(
        "post",
        "/egov-mdms-service/v1/_search",
        "_search",
        [],
        mdmsBody
      );
      return dispatch(prepareFinalObject("searchScreenMdmsData", payload.MdmsRes));
    } catch (e) {
      console.log(e);
    }
  }

  const beforeInitFn = async (action, state, dispatch, fileNumber) => {
    dispatch(prepareFinalObject("workflow.ProcessInstances", []))
    if (fileNumber) {
      await searchResults(action, state, dispatch, fileNumber);
      dispatch(
        handleField(
          `estate-search-account-statement`,
          `components.div.children.headerDiv.children.header.children.fileNumber`,
          `props.number`,
          fileNumber
        )
      )
    }
  }
 
  
  const estateAccountStatementGenerationSearch = {
    uiFramework: "material-ui",
    name: "estate-search-account-statement",
    beforeInitScreen: (action, state, dispatch) => {
      let fileNumber = getQueryArg(window.location.href, "fileNumber");
      getMdmsData(dispatch);
      beforeInitFn(action, state, dispatch, fileNumber);
      return action
    },
    components: {
      div: {
        uiFramework: "custom-atoms",
        componentPath: "Form",
        props: {
          className: "common-div-css",
          id: "search"
        },
        children: {
          headerDiv: {
            uiFramework: "custom-atoms",
            componentPath: "Container",
            children: {
              header: {
                gridDefination: {
                  xs: 12,
                  sm: 6
                },
                ...header
              },
            }
          },
          estateApplicationAccountStatementGen,
          breakAfterSearch: getBreak(),
          searchResultsAccountStatement,
          downloadButton:{
            uiFramework: "custom-atoms",
            componentPath: "Container",
            props: {
              style: { justifyContent: "center", marginTop: 10 }
            },
            visible: false,
            children:{
              searchButton: {
                componentPath: "Button",
                 visible: true,
                gridDefination: {
                   xs: 4,
                   sm: 6,
                  align: "left",
                },
                props: {
                  variant: "contained",
                  style: {
                    color: "white",
                    backgroundColor: "#fe7a51",
                    borderColor:"#fe7a51",
                    borderRadius: "2px",
                    width: "25%",
                    height: "48px",
                    margin:"10px"
                  }
                },
                children: {
                  buttonLabel: getLabel({
                    labelName: "Download",
                    labelKey: "EST_COMMON_DOWNLOAD_PDF"
                  })
                },
                onClickDefination: {
                  action: "condition",
                  callBack: downloadAccountStatementPdf
                },
              },
              downloadXLSButton: {
                componentPath: "Button",
                 visible: true,
                gridDefination: {
                  xs: 4,
                  sm: 6,
                  align: "right",
                },
                props: {
                  variant: "contained",
                  style: {
                    color: "white",
                    backgroundColor: "#fe7a51",
                    borderColor:"#fe7a51",
                    borderRadius: "2px",
                    width: "25%",
                    height: "48px",
                    margin:"10px"
                  }
                },
                children: {
                  buttonLabel: getLabel({
                    labelName: "Download",
                    labelKey: "EST_COMMON_DOWNLOAD_XLS"
                  })
                },
                onClickDefination: {
                  action: "condition",
                  callBack: downloadAccountStatementXLS
                }
              }
            }
          }
        }
      }
    }
  };
  
  export default estateAccountStatementGenerationSearch;