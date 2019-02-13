import React from 'react'
import PropTypes from 'prop-types'
import i18n from '../../utils/i18n/locales'
import { CheckBox } from '@dhis2/d2-ui-core'
import DataSets from '../../components/DatasetsDropdown'
import DataSetOptions from '../../components/DataSetDimensions'
import PeriodPickerComponent from '../../components/PeriodPickerWithPeriodType'
import OrgUnitsTreeWithExtraOptions from '../../components/OrgUnitsTreeWithExtraOptions'

export const DataInputs = props => (
    <div className="row">
        <div className="col-xs-12 col-md-6">
            <OrgUnitsTreeWithExtraOptions />
        </div>
        <div className="col-xs-12 col-md-6">
            <div id="data-set-selection">
                <DataSets onChange={props.onDataSetChange} />
            </div>
            <div id="data-set-dimensions-container">
                <DataSetOptions
                    dimensions={props.dataSetDimensions}
                    dataSetId={props.selectedDataSet.id}
                    values={props.selectedDimensionOptions}
                    onChange={props.onDimensionChange}
                />
            </div>
            <div id="report-period">
                <PeriodPickerComponent label={i18n.t('Report period')} />
            </div>
            <CheckBox
                id="selected-unit-only"
                onChange={props.onSelectedUnitOnlyChange}
                value={props.selectedUnitOnly}
                label={i18n.t('Use data for selected unit only')}
            />
        </div>
    </div>
)

DataInputs.propTypes = {
    dataSetDimensions: PropTypes.array.isRequired,
    selectedDataSet: PropTypes.object.isRequired,
    selectedDimensionOptions: PropTypes.object.isRequired,
    selectedUnitOnly: PropTypes.bool.isRequired,
    onDataSetChange: PropTypes.func.isRequired,
    onDimensionChange: PropTypes.func.isRequired,
    onSelectedUnitOnlyChange: PropTypes.func.isRequired,
}