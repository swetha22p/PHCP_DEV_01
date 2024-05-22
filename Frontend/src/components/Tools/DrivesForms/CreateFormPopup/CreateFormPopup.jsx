import React, { useCallback, useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import styles from "./CreateFormPopup.module.scss";

import { PickList } from 'primereact/picklist';
import { ListBox } from 'primereact/listbox';
import { fetchAllFields, saveFormData } from "../../../../store/features/tools/driveSlice";
import { MultiSelect } from "primereact/multiselect";
import { Steps } from 'primereact/steps';
import { Accordion, AccordionTab } from 'primereact/accordion';
import { showToast } from "../../../../store/features/toast/toastSlice";
        
        


const SelectFieldTemplate = ({control}) => {
    const fieldList = useSelector(state => state.drive.fieldList);
    let source = [ ...fieldList ];
    
    return (
        <div className={styles.selectField}>
            <div className={styles.body__title}>
                Select Field For Data Collection
            </div>
            <div className={styles.selectField__select}>
                <Controller
                    name="fieldArray"
                    control={control}
                    defaultValue={[]}
                    rules={{ required: "This field is required." }}
                    render={({ field }) => {
                        // console.log(field);
                        source = source.filter(item => {
                            return field.value.findIndex((val) => item.fieldId === val.fieldId) === -1
                        });
                        console.log(source);
                        return (
                            <PickList 
                                source={source} target={field.value} 
                                onChange={(e) => {source = e.source; field.onChange(e.target)}}
                                itemTemplate={(item) => (
                                    <div className={styles.picklist__item}>
                                        <div className={styles.picklist__item__name}>{item.fieldName}</div>
                                    </div>
                                )}
                                filter="true" filterBy="name" dataKey="fieldId"
                                sourceHeader="Available" targetHeader="Selected" 
                                sourceStyle={{ height: '15rem' }} targetStyle={{ height: '15rem' }}
                                sourceFilterPlaceholder="Search by name" targetFilterPlaceholder="Search by name" 
                                showSourceControls={false} showTargetControls={false}
                            />
                        );
                    }}
                />
            </div>
        </div>
    );
};

const SelectSubFieldTemplate = ({control, getValues, setValue}) => {
    // let fields = { ...getValues("fieldArray"), selectedSubFieldDict: [] };
    // setValue("fieldArray", fields);
    let fields = getValues("fieldArray");
    console.log("field selected", fields);

    if(fields.length === 0){
        return (
            <div className={styles.selectSubField}>
                <div className={styles.body__title}>
                    Select SubFields for Chosen Fields
                </div>
                <div className={styles.selectSubField__error_message}>
                    No Field Selected in Previous step
                </div>
            </div>
        );
    }

    return (
        <div className={styles.selectSubField}>
            <div className={styles.body__title}>
                Select SubFields for Chosen Fields
            </div>
            <div className={styles.selectSubField__select}>
                {fields.map((field, idx) => (
                    <div className={styles.selectSubField__select__item} key={idx}>
                        <div className={styles.selectSubField__select__item__label}>
                            {field.fieldName}
                        </div>
                        <div className={styles.selectSubField__select__item__select}>
                            <Controller
                                name={`selectedSubFieldDict[id_${field.fieldId}]`}
                                control={control}
                                defaultValue={[]}
                                render={({ field }) => {
                                    console.log(fields[idx].subFieldArray);
                                    return (
                                        <ListBox className="subField_list" value={field.value} multiple
                                        placeholder="Select a City" 
                                        name="value" options={fields[idx].subFieldArray} 
                                        control={control} 
                                        onChange={(e) => {
                                            console.log(e);
                                            setValue(field.name, e.value);
                                        }}
                                        itemTemplate={(item) => (
                                            <div className={styles.picklist__item}>
                                                <span className="radio"></span>
                                                <div className="item">{item.subFieldName}</div>
                                            </div>
                                        )}
                                        />
                                    );
                                }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};


const SelectStationTemplate = ({control, getValues, setValue, register}) => {
    let selectedSubFieldDict = getValues("selectedSubFieldDict");
    const selectedFieldArray = getValues("fieldArray");
    // console.log("selectedSubFieldDict selected", selectedSubFieldDict);

    const [numStations, setNumStations] = useState(getValues("numStations") || 0);
    const dispatch = useDispatch();

    const handleOptionSelection = useCallback((val, field, stnIdx) => {
        let stationData = getValues("stationData");
        let stationId = `id_${stnIdx}`;
        for(let key of Object.keys(stationData)){
            if(!stationData[key] || key === stationId){
                continue;
            }
            for(let optn of stationData[key]){
                console.log(optn);
                if(val.findIndex((item) => item.fieldId === optn.fieldId) !== -1){
                    dispatch(showToast({
                        showToast: true,
                        toastType: 'error',
                        toastMessage: 'Already Selected for another station'
                    }));
                    return;
                }
            }
        }

        field.onChange(val);

    }, [getValues, dispatch]);

    if(!selectedSubFieldDict || selectedFieldArray.length === 0 ||
        Object.values(selectedSubFieldDict).length === 0 || 
        Object.values(selectedSubFieldDict).filter((item) => item.length === 0).length > 0){
        return (
            <div className={styles.selectSubField}>
                <div className={styles.body__title}>
                    Configure Data Collection Stations
                </div>
                <div className={styles.selectSubField__error_message}>
                    No Field Selected in Previous step
                </div>
            </div>
        );
    }

    return (
        <div className={styles.selectStation}>
            <div className={styles.body__title}>
                Configure Data Collection Stations
            </div>
            <div className={styles.selectStation__input}>
                <div className={styles.selectStation__input__label}>
                    No. of Stations
                </div>
                <div className={styles.selectStation__input__input}>
                    <input type="number" min={0} value={numStations} onChange={(e) => {
                        let val = e.target.value? parseInt(e.target.value) : 0;
                        setNumStations(val);
                        let prevNumStations = getValues("numStations");
                        if(prevNumStations > val){
                            for(let i = prevNumStations; i >= val; i--){
                                setValue(`stationData[id_${i}]`, []);
                            }
                        }
                        setValue("numStations", val);
                    }} />
                </div>
            </div>
            <div className={styles.selectStation__select}>
                {[...Array(numStations)].map((_, idx) => {
                    return (
                        <div className={styles.selectStation__select__item} key={idx}>
                            <div className={styles.selectStation__select__item__label}>
                                Station {idx + 1}
                            </div>
                            <div className={styles.selectStation__select__item__select}>
                                <Controller
                                    name={`stationData[id_${idx}]`}
                                    control={control}
                                    rules={{ required: 'This field is required.' }}
                                    render={({ field }) => (
                                        <MultiSelect className={styles.multiselect}
                                            id={field.id} 
                                            value={field.value} 
                                            optionLabel="fieldName" 
                                            options={selectedFieldArray} 
                                            onChange={(e) => {
                                                // field.onChange(e.value);
                                                handleOptionSelection(e.value, field, idx);
                                            }} 
                                            filter={true}
                                            display="chip"
                                            placeholder="Select Fields"/>
                                    )}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );    
};

const PageLogicTemplate = ({control, getValues, setValue, register, stationId, pageIdx}) => {
    const [ conditions, setConditions ] = useState(getValues(`pages.config.stn_${stationId}.pg_${pageIdx}.conditions`)??[]);
    const [ logicOption, setLogicOption ] = useState(getValues(`pages.config.stn_${stationId}.pg_${pageIdx}.logicOption`));
    const [ numStations, _ ] = useState(getValues("numStations") || 0);
    const [ conditionOptions, setConditionOptions ] = useState([]);
    
    useEffect(() => {
        const stationData = getValues("stationData");
        let fieldArray = stationData[`id_${stationId}`];
        let selectedSubFieldDict = getValues("selectedSubFieldDict");
        let conditionOptions = [];
        for(let field of fieldArray){
            let subFieldArray = selectedSubFieldDict[`id_${field.fieldId}`];
            for(let subField of subFieldArray){
                conditionOptions.push({
                    fieldId: field.fieldId,
                    subFieldId: subField.subFieldId,
                    fieldName: field.fieldName,
                    subFieldName: subField.subFieldName,
                });
            }
        }
        setConditionOptions(conditionOptions);
    }, [stationId, getValues]);

    const operators = [
        {label: '==', value: 'eq'},
        {label: '!=', value: 'neq'},
        {label: '>', value: 'gt'},
        {label: '>=', value: 'gte'},
        {label: '<', value: 'lt'},
        {label: '<=', value: 'lte'},
    ];

    return (
        <Accordion className="page__logic">
            <AccordionTab header="Page Logic">
                <div className={styles.page__logic__container}>
                    <div className={styles.page__logic__container__body}>
                        <div className={styles.page__logic__container__body__item}>
                            {/* <div className={styles.page__logic__container__body__item__label}>
                                Option:
                            </div> */}
                            <div className={styles.page__logic__container__body__item__input}>
                                <div className={styles.page__logic__container__body__item__select__radio}>
                                    <input type="radio" value="api" id="ApiOption"
                                        {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.logicOption`,
                                            {
                                                onChange: (e)=>{ setLogicOption(e.target.value) }
                                            })
                                        } />
                                    <label htmlFor="ApiOption">API Option</label>
                                </div>
                                <div className={styles.page__logic__container__body__item__select__radio}>
                                    <input type="radio" value="conditional" id="Conditional"
                                        {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.logicOption`,
                                            {
                                                onChange: (e)=>{ setLogicOption(e.target.value) }
                                            })
                                        } />    
                                    <label htmlFor="Conditional">Conditional Statement</label>
                                </div>
                            </div>
                        </div>
                        {logicOption === "api" && 
                        <div className={styles.page__logic__container__body__item}>
                            <div className={styles.page__logic__container__body__item__label}>
                                API Endpoint
                            </div>
                            <div className={styles.page__logic__container__body__item__input}>
                                <input type="text" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.apiEndpoint`)} />
                            </div>
                        </div>}
                        {logicOption === "conditional" && 
                        <div className={styles.page__logic__container__body__item}>
                            <div className={styles.page__logic__container__body__item__actions}>
                                <div className={styles.page__logic__container__body__item__actions__add} onClick={()=>setConditions(prev => [ ...prev, {} ])}>
                                    <i className="pi pi-plus-circle"></i>
                                    <div className={styles.page__logic__container__body__item__actions__add__label}>
                                        Add
                                    </div>
                                </div>
                                <div className={styles.page__logic__container__body__item__actions__remove} onClick={()=>{
                                        let newConditions = [...conditions];
                                        newConditions.splice(newConditions.length-1, 1);
                                        setConditions(newConditions);
                                    }}>
                                    <i className="pi pi-minus-circle"></i>
                                    <div className={styles.page__logic__container__body__item__actions__remove__label}>
                                        Remove
                                    </div>
                                </div>
                            </div>
                            <div className={styles.page__logic__container__body__item__logic}>
                                {conditions?.map((_, cIdx) => (
                                    <div className={styles.page__logic__container__body__item__logic__row} key={cIdx}>
                                        <div className={styles.page__logic__container__body__item__logic__row__field}>
                                            <select {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.conditions[${cIdx}].field`)}>
                                                {conditionOptions.map((fItem, fIdx) => <option value={`${fItem.fieldId}:${fItem.subFieldId}`} key={fIdx}>{fItem.fieldName}: {fItem.subFieldName}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.page__logic__container__body__item__logic__row__operator}>
                                            <select {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.conditions[${cIdx}].operator`)}>
                                                {operators.map((oItem, oIdx) => <option value={oItem.value} key={oIdx}>{oItem.label}</option>)}
                                            </select>
                                        </div>
                                        <div className={styles.page__logic__container__body__item__logic__row__value}>
                                            <input type="text" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.conditions[${cIdx}].value`)} />
                                        </div>
                                    </div>))}
                            </div>
                            <div className={styles.page__logic__container__body__item__logic__condition}>
                                <div className={styles.page__logic__container__body__item__logic__condition__radio}>
                                    <input type="radio" value="all" id="all" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.logicCondition`)} />
                                    <label htmlFor="all">ALL</label>
                                </div>
                                <div className={styles.page__logic__container__body__item__logic__condition__radio}>
                                    <input type="radio" value="any" id="any" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.logicCondition`)} />
                                    <label htmlFor="any">ANY</label>
                                </div>
                            </div>
                        </div>}
                        <div className={styles.page__logic__container__body__item__logic__result}>
                            <div className={styles.page__logic__container__body__item__logic__result__select}>
                                <label htmlFor="yes">True</label>
                                <select id="yes" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.result.true.stationId`)}>
                                    {[...Array(numStations)].map((_, sIdx) => <option value={sIdx} key={sIdx}>Station {sIdx+1}</option>)}
                                </select>
                                <input type="number" placeholder="Enter Page No." {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.result.true.pageNum`)} />
                            </div>
                            <div className={styles.page__logic__container__body__item__logic__result__select}>
                                <label htmlFor="no">False</label>
                                <select id="no" {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.result.false.stationId`)}>
                                    {[...Array(numStations)].map((_, sIdx) => <option value={sIdx} key={sIdx}>Station {sIdx+1}</option>)}
                                </select>
                                <input type="number" placeholder="Enter Page No." {...register(`pages.config.stn_${stationId}.pg_${pageIdx}.result.false.pageNum`)} />
                            </div>
                        </div>
                    </div>
                </div>
            </AccordionTab>
        </Accordion>
    );
};

const ConfigurePageTemplate = ({control, getValues, setValue, register, watch, stationId}) => {
    const [ stnPages, setStnPages ] = useState(getValues(`pages.idx_${stationId}`)??[]);
    const selectedSubFieldDict = getValues("selectedSubFieldDict");

    const [ fields, setFields ] = useState([]);

    console.log("Stations ID", stationId);
    useEffect(() => {
        const stationData = getValues("stationData");
        setStnPages(getValues(`pages.idx_${stationId}`)??[]);

        let data = stationData[`id_${stationId}`]??[];
        let fieldsDataArray = [];
        for(let f of data){
            let key = `id_${f.fieldId}`;
            if(!(key in selectedSubFieldDict)){
                // Do Nothing
            }
            else{
                console.log("Yes")
                fieldsDataArray.push({
                    ...f,
                    selectedSubFields: selectedSubFieldDict[`id_${f.fieldId}`]
                });
            }
        }
        console.log("data", fieldsDataArray);
        setFields(fieldsDataArray);
        console.log("stationData", stationData[`id_${stationId}`]);
    }, [stationId, getValues, selectedSubFieldDict]);

    useEffect(() => {
        setValue(`pages.idx_${stationId}`, stnPages);
        console.log("pages", getValues());
        console.log("stnPages", stnPages);
    }, [stnPages.length, stationId, stnPages, getValues, setValue ]);

    return (
        <div className={styles.page__container}>
            <div className={styles.page__container__header}>
                <div className={styles.add_page} type="button" 
                    onClick={()=>{
                        setStnPages((prev)=>[...prev, {}]);
                    }}>
                        <i className="pi pi-plus-circle"></i>
                        Add Page
                    </div>
            </div>
            <div className={styles.page__container__body}>
                {stnPages.length === 0 && <div className={styles.page__container__error_message}>
                    No Page Added
                </div>}
                {stnPages.length >0 && <Accordion className={styles.page__container__body__item}>
                    {stnPages.map((_, pageIdx) => {
                        return (
                        <AccordionTab header={
                            <div className={styles.page__container__body__item__header}>
                                <div className={styles.page__container__body__item__header__title}>
                                    Page {pageIdx + 1}
                                </div>
                                <div className={styles.page__container__body__item__header__actions}>
                                    <i style={{padding: '5px'}} className="pi pi-minus-circle" onClick={()=>{
                                        setStnPages((prev)=>prev.filter((_, i)=>i!==pageIdx));
                                        setValue(`pages.config.stn_${stationId}.pg_${pageIdx}`, {});
                                    }}></i>
                                </div>
                            </div>
                        } key={pageIdx}>
                            <div className={styles.selectSubField__select}>
                                {fields.map((field, field_idx) => (
                                    <div className={styles.selectSubField__select__item} key={field_idx}>
                                        <div className={styles.selectSubField__select__item__label}>
                                            {field.fieldName}
                                        </div>
                                        <div className={styles.selectSubField__select__item__select}>
                                            <Controller
                                                name={`pages.config.stn_${stationId}.pg_${pageIdx}.fields.id_${field.fieldId}`}
                                                control={control}
                                                defaultValue={[]}
                                                render={({ field }) => {
                                                    return (
                                                        <ListBox className="subField_list" 
                                                        value={field.value} 
                                                        multiple
                                                        placeholder="Select Sub Fields" 
                                                        name="value" 
                                                        options={fields[field_idx].selectedSubFields} 
                                                        control={control} 
                                                        onChange={(e) => {
                                                            console.log(e);
                                                            setValue(field.name, e.value);
                                                        }}
                                                        itemTemplate={(item) => (
                                                            <div className={styles.picklist__item}>
                                                                <span className="radio"></span>
                                                                <div className="item">{item.subFieldName}</div>
                                                            </div>
                                                        )}
                                                        />
                                                    );
                                                }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <PageLogicTemplate control={control} getValues={getValues} setValue={setValue} 
                                register={register} watch={watch} stationId={stationId} pageIdx={pageIdx} />
                        </AccordionTab>
                    )})}
                </Accordion>}
            </div>
        </div>
    );
};

const ConfigureStationTemplate = ({control, getValues, setValue, register, watch}) => {
    const selectedSubFieldDict = getValues("selectedSubFieldDict");
    const selectedFieldArray = getValues("fieldArray");
    const numStations = getValues("numStations");

    const [ stationId, setStationId ] = useState(0);

    console.log(numStations, selectedFieldArray)

    if(!selectedSubFieldDict || selectedFieldArray.length === 0 ||
        Object.values(selectedSubFieldDict).length === 0 || 
        Object.values(selectedSubFieldDict).filter((item) => item.length === 0).length > 0 ||
        !numStations || numStations === 0){
            return (
                <div className={styles.selectSubField}>
                    <div className={styles.body__title}>
                        Configure Data Collection Stations
                    </div>
                    <div className={styles.selectSubField__error_message}>
                        No configuration done in Previous step
                    </div>
                </div>
            );
    }

    const items = [];
    
    for(let i=0; i<numStations; i++){
        items.push({
            label: `Station ${i+1}`,
            command: (_) => {
                setStationId(i);
            }
        });
    }

    return (
        <div className={styles.configStation}>
            <div className={styles.body__title}>
                Configure Data Collection Stations
            </div>
            <div className={styles.configStation__body}>
                <div className={styles.configStation__numStation__label}>
                    <Steps model={items} activeIndex={stationId} readOnly={false} />
                </div>
                <div className={styles.configStation__pages__panel}>
                    <ConfigurePageTemplate control={control} getValues={getValues} setValue={setValue} 
                        register={register} stationId={stationId} watch={watch} />
                </div>
            </div>
        </div>
    );
};

const CreateFormPopup = (props) => {

    const  user = useSelector(state => state.user);
    const { register, control, setValue, getValues, handleSubmit, watch } = useForm({});

    const dispatch = useDispatch();
    
    useEffect(() => {
        dispatch(fetchAllFields());
        // dispatch(showToast({toastType: 'error', toastMessage:'Error occured'}));
    }, [dispatch]);

    // Page Functions
    const [ currentPageIndex, setCurrentPageIndex ] = useState(0);
    const [ pageFunctions, setPageFunctions ] = useState([]);

    useEffect(() => {
        setPageFunctions([
            <SelectFieldTemplate control={control} />,
            <SelectSubFieldTemplate control={control} getValues={getValues} setValue={setValue} />,
            <SelectStationTemplate control={control} register={register} getValues={getValues} setValue={setValue} />,
            <ConfigureStationTemplate control={control} register={register} getValues={getValues} setValue={setValue} watch={watch} />
        ]);
    }, [control, getValues, setValue, register, watch]);


    

    const onSubmit = (data) => {
        try{
            console.log(data);

            let stations = [];
            for(let key of Object.keys(data['pages']['config'])){
                let stationId = key.split('_')[1];
                let pages = data['pages']['config'][key];
                
                let stationData = {
                    field_count: Array(data['stationData'][`id_${stationId}`]).length,
                    fields: (data['stationData'][`id_${stationId}`]).map((field) => {
                        return field.fieldId
                    }),
                    page_count: Object.keys(pages).length,
                    pages: []
                };
        
                for(let pageKey of Object.keys(pages)){
                    let pageId = pageKey.split('_')[1];
                    let pageData = {
                        page_id: pageId,
                        subfield_count: Array(pages[pageKey]['conditions']).length,
                        subfields: pages[pageKey]['conditions']?.map((optn) => {
                            return {
                                field_id : optn.field.fieldId, 
                                subfield_id : optn.field.subFieldId
                            }
                        }),
                        logic: {
                            external_api: pages[pageKey]['logicOption'] === 'api',
                            operation: pages[pageKey]['logicCondition'] === 'all' ? 'and' : 'or',
                            external_api_id: pages[pageKey]['apiEndpoint'],
                            logic: pages[pageKey]['conditions']?.map((optn) => {
                                return {
                                    field_id : optn.field.split(':')[0], 
                                    subfield_id : optn.field.split(':')[1],
                                    operation: optn.operator,
                                    value: optn.value
                                }
                            })
                        },
                        destination_true: {
                            station_id: pages[pageKey]['result']['true']['stationId'],
                            page_id: pages[pageKey]['result']['true']['pageNum']
                        },

                        destination_false: {
                            station_id: pages[pageKey]['result']['false']['stationId'],
                            page_id: pages[pageKey]['result']['false']['pageNum']
                        }
                    };
        
                    stationData.pages.push(pageData);
                }
        
                stations.push(stationData);
            };
        
            const formData = {
                form_name: data.formName,
                created_by: user.id,
                created_date: new Date().toLocaleDateString(),
                stations: [ ...stations ]
            };
        
            console.log(formData);
            console.log(JSON.stringify(formData));

            dispatch(saveFormData(formData));

            props.onClose();

        }
        catch(err){
            console.log(err);
            dispatch(showToast({toastType: 'error', toastMessage:'Something went wrong, Please check the form data'}));
        }
    
    };

    return (
        <div className={styles.container}>
            <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
                <div className={styles.header}>
                    <div className={styles.header__body}>
                        <div className={styles.header__title}>
                            <input type="text" placeholder="Form Name" {...register("formName", {required: "This field is required."})}/>
                        </div>
                        <div className={styles.header__metadata}>
                            <div className={styles.header__metadata__item}>
                                Created By: {user.firstName} {user.lastName}
                            </div>
                            <div className={styles.header__metadata__item}>
                                Date created: {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                    <div className={styles.header__close}>
                        <i className="pi pi-times-circle" onClick={props.onClose}></i>
                    </div>
                </div>
                <div className={styles.body}>
                    {pageFunctions[currentPageIndex]}
                </div>
                <div className={styles.footer}>
                    <button type="button" disabled={currentPageIndex === 0} onClick={() => {setCurrentPageIndex(prev => prev-1)}}>Previous</button>
                    <button type="button" hidden={currentPageIndex === (pageFunctions.length - 1)} onClick={() => {setCurrentPageIndex(prev => prev+1)}}>Next</button>
                    <button type="submit" hidden={currentPageIndex !== (pageFunctions.length - 1)}>Submit</button>
                </div>
            </form>
        </div>
    );
        
};

export default CreateFormPopup;