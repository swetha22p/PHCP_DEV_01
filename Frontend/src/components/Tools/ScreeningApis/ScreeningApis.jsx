import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchScreeningAPIs } from '../../../store/features/tools/apiSlice';
import './ScreeningApis.scss'

const ScreeningApis = () => {

    const screeningApisData = useSelector(state => state.screenApi.screeningApisData);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(fetchScreeningAPIs());
    }, [dispatch]);

    return (
        <>
            <div className="apis-container">

                <div className="apis-list">

                    <div className='search'>
                        <input className='searchBar' type="text"/>
                        <img className="search-icon" src="/assets/icons/web/active/search-icon.svg" alt="search"></img>
                    </div>

                    {screeningApisData.map((item, idx) =>
                        <div className="api" key={idx}>
                            <div className='file'><i className='pi pi-plus'/></div>
                            <div className="left">
                                <div className="api-description">
                                    <div className='api-name'>{item.name}</div>
                                    <span className='description'>{item.description}</span>
                                </div>
                            </div>
                            <div className="right">
                                <div className="api-input">
                                    <div className='api-name'>INPUT</div>
                                    <div className='fields'>
                                        {item.input.map((ipItem, idx) => (
                                            <div className="api-field" key={idx}>{ipItem.name}:{ipItem.type}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="api-output">
                                    <div className='api-name'>OUTPUT</div>
                                    <span className='description'>{item.output}</span>
                                </div>

                            </div>
                            <div className='logo'> LOGO </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    );
}

export default ScreeningApis;