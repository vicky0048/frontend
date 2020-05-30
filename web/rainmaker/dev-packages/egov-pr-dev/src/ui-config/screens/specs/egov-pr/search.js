import {
  getCommonHeader,
  getLabel,
  getBreak
} from "egov-ui-framework/ui-config/screens/specs/utils";
import { httpRequest } from "../../../../ui-utils";

import { showHideAdhocPopup, resetFields, getRequiredDocData } from "../utils";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { pendingApprovals } from "./searchResource/pendingApprovals";
import { searchResults } from "./searchResource/searchResults";
import { setBusinessServiceDataToLocalStorage } from "egov-ui-framework/ui-utils/commons";
import {
  getTenantId,
  localStorageGet,

  localStorageSet
} from "egov-ui-kit/utils/localStorageUtils";
import find from "lodash/find";
import set from "lodash/set";
import get from "lodash/get";
import {
  prepareFinalObject,
  handleScreenConfigurationFieldChange as handleField
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getRequiredDocuments } from "./requiredDocuments/reqDocs";
import { getGridData } from "./searchResource/citizenSearchFunctions";
import {EventFilter} from "./gridFilter/Filter";
const hasButton = getQueryArg(window.location.href, "hasButton");
let enableButton = true;
enableButton = hasButton && hasButton === "false" ? false : true;

const header = getCommonHeader({
  labelName: "MANAGE EVENT",
  labelKey: "PR_MANAGE_EVENT"
});

const pageResetAndChange = (state, dispatch) => {
  dispatch(
    prepareFinalObject("PublicRelations", [{ "PublicRelationDetails.PublicRelationType": "NEW" }])
  );
  
};
const getMdmsData = async (action, state, dispatch) => {
  debugger
  let tenantId =
    get(
      state.screenConfiguration.preparedFinalObject,
      "PublicRelations[0].PublicRelationDetails.propertyDetails.address.city"
    ) || getTenantId();

    //let tenantId =    
  let mdmsBody = {
    MdmsCriteria: {
      tenantId: tenantId,
      moduleDetails: [
        {
          moduleName: "RAINMAKER-PR",
          masterDetails: [{ name: "eventStatus" }, { name: "eventScheduledStatus" }]
        },
       
        //, { name: "eventStatus" }, { name: "localityAreaName" }
       


        {
          moduleName: "tenant",
          masterDetails: [
            {
              name: "tenants"
            }
          ]
        },
       
      ]
    }
  };
  try {
    let payload = null;
    payload = await httpRequest(
      "post",
      "/egov-mdms-service/v1/_search",
      "_search",
      [],
      mdmsBody
    );
    debugger


    //payload.MdmsRes["RAINMAKER-PR"].eventScheduledStatus[0]='{code: "ALL", name: "All", active: true}'
    dispatch(prepareFinalObject("applyScreenMdmsData", payload.MdmsRes));
  } catch (e) {
    console.log(e);
  }
};
const NOCSearchAndResult = {
  uiFramework: "material-ui",
  name: "search",
  beforeInitScreen: (action, state, dispatch) => {
//    dispatch(prepareFinalObject("PublicRealation[0].filterEvent", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterInviteEvent", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterpress", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filtertender", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterpressMaster", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterLibraryEvent", {}));
    dispatch(prepareFinalObject("TimeseriesReport", {}));
    dispatch(prepareFinalObject("LocalityReport", {}));
    dispatch(prepareFinalObject("eventReport", {}));

  getGridData(action, state, dispatch);

  localStorageSet("shoWHideCancel","search")
    const tenantId = getTenantId();

    getMdmsData(action, state, dispatch)

    // const BSqueryObject = [
    //   { key: "tenantId", value: tenantId },
    //   { key: "businessServices", value: "PRSCP" }
    // ];
    // setBusinessServiceDataToLocalStorage(BSqueryObject, dispatch);
    // const businessServiceData = JSON.parse(
    //   localStorageGet("businessServiceData")
    // );
    // const data = find(businessServiceData, { businessService: "PRSCP" });
    // const { states } = data || [];
    // if (states && states.length > 0) {
    //   const status = states.map((item, index) => {
    //     return {
    //       code: item.state
    //     };
    //   });
    //   dispatch(
    //     prepareFinalObject(
    //       "applyScreenMdmsData.searchScreen.status",
    //       status.filter(item => item.code != null)
    //     )
    //   );
    // }
    getRequiredDocData(action, state, dispatch).then(() => {
      let documents = get(
        state,
        "screenConfiguration.preparedFinalObject.searchScreenMdmsData.PublicRelation.Documents",
        []
      );
      set(
        action,
        "screenConfig.components.adhocDialog.children.popup",
        getRequiredDocuments(documents)
      );
    });
    return action;
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
            }}
          //   newApplicationButton: {
          //     componentPath: "Button",
          //     gridDefination: {
          //       xs: 12,
          //       sm: 6,
          //       align: "right"
          //     },
          //     visible: enableButton,
          //     props: {
          //       variant: "contained",
          //       color: "primary",
          //       style: {
          //         color: "white",
          //         borderRadius: "2px",
          //         width: "250px",
          //         height: "48px"
          //       }
          //     },

          //     children: {
          //       plusIconInsideButton: {
          //         uiFramework: "custom-atoms",
          //         componentPath: "Icon",
          //         props: {
          //           iconName: "add",
          //           style: {
          //             fontSize: "24px"
          //           }
          //         }
          //       },

          //       buttonLabel: getLabel({
          //         labelName: "NEW APPLICATION",
          //         labelKey: "NOC_HOME_SEARCH_RESULTS_NEW_APP_BUTTON"
          //       })
          //     },
          //     onClickDefination: {
          //       action: "condition",
          //       callBack: (state, dispatch) => {
          //         pageResetAndChange(state, dispatch);
          //         showHideAdhocPopup(state, dispatch, "search");
          //       }
          //     },
          //     roleDefination: {
          //       rolePath: "user-info.roles",
          //       roles: ["NOC_CEMP", "SUPERUSER"]
          //     }
          //   }
          // }
        },
        // pendingApprovals,
        EventFilter,
        breakAfterSearch: getBreak(),
        // progressStatus,
        searchResults
      }
    },
    adhocDialog: {
      uiFramework: "custom-containers-local",
      moduleName: "egov-noc",
      componentPath: "DialogContainer",
      props: {
        open: false,
        maxWidth: false,
        screenKey: "search"
      },
      children: {
        popup: {}
      }
    }
  }
};

export default NOCSearchAndResult;
