import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import styled from "styled-components";
import { v4 as uuidv4 } from 'uuid';

const ErrorTray = styled.div`
  position: absolute;
  top: 0px;
  right: 0px;
  z-index: 30;
`

// inspiration for how to do the transition part came from here 
// https://letsbuildui.dev/articles/how-to-animate-mounting-content-in-react
const ErrorBox = styled.div`
  position: relative;
  padding: 10px;
  background-color: red;
  color: white;

  margin: 10px;

  opacity: 0;
  transform: translateY(15px);
  transition: opacity 1s ease, transform 1s ease;

  &[data-visible="yes"] {
    opacity: 1;
    transform: translateY(0);
  }

  p {
    padding: 0px;
    margin: 0px;
  }
`

const ErrorDisplay = forwardRef((props, ref) => {
  const [errors, _setErrors] = useState([]);
  const errorsRef = useRef(errors);
  const setErrors = data => {
    errorsRef.current = data;
    _setErrors(data);
  }
  const intervalRef = useRef();

  const clearOld = () => {
    //console.log("clearing old errors", errorsRef.current);
    const currentTs = Math.floor(Date.now() / 1000);
    setErrors(
      errorsRef.current.filter(e => currentTs - e.created < props.displayLength)
      .map(e => {
        return({
          ...e,
          visible: currentTs - e.created < (props.displayLength - 2)
        })
      })
    );
  }

  useImperativeHandle(ref, () => ({
    addError(text) {
      setErrors(
        [{
          id: uuidv4(),
          errorText: text,
          created: Math.floor(Date.now() / 1000),
          visible: true
        }].concat(errors)
      );
    }
  }));

  // need to create clean up callback
  useEffect(() => {
    // clear the form
    console.log("creating error cleanup sub");
    intervalRef.current = setInterval(() => {
      clearOld();
    }, 1000);

    return () => {
      console.log("clearing old interval");
      clearInterval(intervalRef.current);
    }

  }, []);

  const ErrorBoxes = errors.map(error => <ErrorBox data-visible={error.visible ? "yes": "no"} key={"error_" + error.id}>{error.errorText}</ErrorBox>)

  return(
    <div>
      <ErrorTray>
        {ErrorBoxes}
      </ErrorTray>
    </div>
  )
});

export default ErrorDisplay;