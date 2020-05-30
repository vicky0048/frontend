import {
  getCommonHeader,
  getLabel,
  getBreak
} from "egov-ui-framework/ui-config/screens/specs/utils";
import { showHideAdhocPopup, resetFields, getRequiredDocData } from "../utils";
import { getQueryArg } from "egov-ui-framework/ui-utils/commons";
import { pendingApprovals } from "./searchResource/pendingApprovals";
import { eventlistforinvitation } from "./inviteResources/searchResults";

import {
  getTenantId,
  localStorageGet
} from "egov-ui-kit/utils/localStorageUtils";
import find from "lodash/find";
import set from "lodash/set";
import get from "lodash/get";
import {
  prepareFinalObject,
  handleScreenConfigurationFieldChange as handleField
} from "egov-ui-framework/ui-redux/screen-configuration/actions";
import { getRequiredDocuments } from "./requiredDocuments/reqDocs";
import { getEventListforInvitation } from "./searchResource/citizenSearchFunctions";
import {InviteGuestFilter} from "./gridFilter/Filter";
import { httpRequest } from "../../../../ui-utils";

const hasButton = getQueryArg(window.location.href, "hasButton");
let enableButton = true;
enableButton = hasButton && hasButton === "false" ? false : true;

const header = getCommonHeader({
  labelName: "Invite Guest",
  labelKey: "PR_INVITE_GUEST"
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

	console.log("Event Statusssssssss");
	console.log(payload.MdmsRes)
	let responsedata = payload.MdmsRes['RAINMAKER-PR'].eventScheduledStatus;
	responsedata.splice(0, 1);
    dispatch(prepareFinalObject("applyScreenMdmsData", payload.MdmsRes));
  } catch (e) {
    console.log(e);
  }
};
const EventSearchAndResult = {
  uiFramework: "material-ui",
  name: "eventList",
  beforeInitScreen: (action, state, dispatch) => {
    dispatch(prepareFinalObject("PublicRealation[0].filterEvent", {}));
 //   dispatch(prepareFinalObject("PublicRealation[0].filterInviteEvent", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterpress", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filtertender", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterpressMaster", {}));
    dispatch(prepareFinalObject("PublicRealation[0].filterLibraryEvent", {}));
    
    dispatch(prepareFinalObject("TimeseriesReport", {}));
    dispatch(prepareFinalObject("LocalityReport", {}));
    dispatch(prepareFinalObject("eventReport", {}));

    
  getEventListforInvitation(action, state, dispatch);
  getMdmsData(action, state, dispatch)

    const tenantId = getTenantId();
   
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
        },
        InviteGuestFilter,
        breakAfterSearch: getBreak(),
        eventlistforinvitation
      }
    },
    adhocDialog: {
      uiFramework: "custom-containers-local",
      moduleName: "egov-pr",
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

export default EventSearchAndResult;
