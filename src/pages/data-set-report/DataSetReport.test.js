/* eslint-disable */
import React from 'react';
import { shallow } from 'enzyme';

import { CheckBox, Button } from '@dhis2/d2-ui-core';

import DataSetReport from './DataSetReport';
import DataSets from '../../components/datasets-dropdown/DatasetsDropdown';
import OrganisationUnitsTree from '../../components/available-organisation-units-tree/AvailableOrganisationUnitsTree';
import OrganisationUnitGroupOptions from '../../components/organisation-unit-group-sets/OrganisationUnitGroupSets';
import DataSetOptions from '../../components/data-set-dimensions/DataSetDimensions';
import PeriodPickerComponent from '../../components/period-picker-with-period-type/PeriodPickerWithPeriodType';
import ShareComment from './Share';
import Report from '../../components/report/Report';

import fakerData from '../../helpers/fakerTests';

import {
    sections,
    DATA_SET_REPORT_SECTION_KEY
} from '../sections.conf';

let pageInfo = {};
for(let i = 0; i < sections.length; i++) {
    const section = sections[i];
    if (section.key === DATA_SET_REPORT_SECTION_KEY) {
        pageInfo = section.info;
        break;
    }
}

jest.mock('@dhis2/d2-ui-org-unit-tree', () => ({
    OrgUnitTree: ('OrgUnitTree'),
}));

const ownShallow = () => {
    return shallow(
        <DataSetReport
            sectionKey={DATA_SET_REPORT_SECTION_KEY}
            pageInfo={pageInfo}
            updateAppState={jest.fn()}
            currentSection={DATA_SET_REPORT_SECTION_KEY}
            d2={fakerData.d2}
        />,
        {
            disableLifecycleMethods: true
        }
    );
};

describe('Test <DataSetReport /> rendering:', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = ownShallow();
    });

    it('Should render without crashing', () => {
        ownShallow();
    });

    it('Should display form', () => {
        expect(wrapper.find('#data-set-report-form').props().style.display).toBe('block');
    });

    it('Should render form with correct components', () => {
        const form = wrapper.find('#data-set-report-form');
        expect(form.find(OrganisationUnitsTree)).toHaveLength(1);
        expect(form.find('span')).toHaveLength(1); // show more options
        expect(form.find(DataSets)).toHaveLength(1);
        expect(form.find(PeriodPickerComponent)).toHaveLength(1);
        expect(form.find(CheckBox)).toHaveLength(1);
        expect(form.find(Button)).toHaveLength(1);
    });

    it('Should render DataSetOptions when data set selected', () => {
        const dataSetId = 'fakeDataSetId';
        wrapper.setState({ selectedDataSet: dataSetId });
        expect(wrapper.find(DataSetOptions)).toHaveLength(1);
    });

    it('Should display no form when showForm is false', () => {
        wrapper.setState({ showForm: false });
        expect(wrapper.find('#data-set-report-form').props().style.display).toBe('none');
    });

    it('Should display no options when showOptions is false', () => {
        expect(wrapper.find('#extra-options').props().style.display).toBe('none');
    });

    it('Should display options when showOptions is true', () => {
        wrapper.setState({ showOptions: true });
        expect(wrapper.find('#extra-options').props().style.display).toBe('block');
    });

    it('Should render OrganisationUnitGroupOptions when showOptions is true', () => {
        wrapper.setState({ showOptions: true });
        const form = wrapper.find('#data-set-report-form');
        expect(form.find(OrganisationUnitGroupOptions)).toHaveLength(1);
    });

    it('Should have the form Button disabled', () => {
        const form = wrapper.find('#data-set-report-form');
        expect(form.find(Button).props().disabled).toBeTruthy();
    });
    /*
    it('Should enable form Button', () => {
        const form = wrapper.find('#data-set-report-form');
        wrapper.setState({
            selectedOrgUnit: 'OrgUnitId',
            selectedDataSet: 'DataSetId',
            selectedPeriod: '2018',
            loading: false,
        });
        expect(form.find(Button).props().disabled).toBeFalsy();
    });
    */
    it('Should render no report container', () => {
        expect(wrapper.find('#report-container')).toHaveLength(0);
    });

    it('Should render the correct components on report container', () => {
        wrapper.setState({
            reportHtml: '<div>Report</div>',
            showForm: false,
        });
        const reportContainer = wrapper.find('#report-container');
        expect(reportContainer.find('span')).toHaveLength(1);           // Download button
        expect(reportContainer.find(ShareComment)).toHaveLength(1);
        expect(reportContainer.find(Report)).toHaveLength(1);
    });
});

describe('Test <DataSetReport /> actions:', () => {
    let wrapper;
    beforeEach(() => {
        wrapper = ownShallow();
    });

    it('Should update selectedDataSet when DataSets selected', () => {
        const dataSetId = 'fakeDataSetId';
        wrapper.find(DataSets).simulate('change', dataSetId);
        expect(wrapper.state('selectedDataSet')).toEqual(dataSetId);
    });

    it('Should update toggle showOptions when option is clicked', () => {
        const showMoreOptions = wrapper.find('#data-set-report-form').find('span');
        showMoreOptions.simulate('click');
        expect(wrapper.state('showOptions')).toBeTruthy();
        showMoreOptions.simulate('click');
        expect(wrapper.state('showOptions')).toBeFalsy();
    });
    /*
    it('Should call generateReport function when form button is clicked.', () => {
        const form = wrapper.find('#data-set-report-form');
        wrapper.instance().generateReport = jest.fn();
        wrapper.generateReport = jest.fn();
        wrapper.setState({
            selectedOrgUnit: 'OrgUnitId',
            selectedDataSet: 'DataSetId',
            selectedPeriod: '2018',
            loading: false,
        });
        wrapper.update();
        form.find(Button).simulate('click');
        expect(wrapper.instance().generateReport).toHaveBeenCalled();
    });
    */
    /*
    it('Should call exportReportToXls function when download button is clicked.', () => {
        wrapper.setState({
            reportHtml: '<div>Report</div>',
            showForm: false,
        });
        const reportContainer = wrapper.find('#report-container');
        wrapper.instance().exportReportToXls = jest.fn();
        wrapper.update();
        reportContainer.find('span').simulate('click');
        expect(wrapper.instance().exportReportToXls).toHaveBeenCalled();
    });
    */
});