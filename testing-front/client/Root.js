import React from "react";
import {Router, Route} from 'react-router-dom';
import VideoPlayer from './VideoPlayer';

export default class Root extends React.Component {

    constructor(props){
        super(props);
    }

    render(){
        return (
            <div>
                <Route exact path="/stream/:username" render={(props) => (
                    <VideoPlayer {...props}/>
                )}/>
            </div>
        )
    }
}