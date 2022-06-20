import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: calc(100% - ${props => props.buffer}px);
`

const InjectContainerSize = ({children, heightBuffer = 0}) => {
  const ref = useRef();
  const [rect, setRect] = useState({
    width: 0,
    height: 0
  });

  useEffect(() => {
    const displayObserver = new ResizeObserver(entries => {
      try {
        const containerRect = ref.current.getBoundingClientRect();
        console.log("container size", containerRect);
        setRect({
          width: containerRect.width,
          height: containerRect.height
        });
      } catch(err) {
        console.log("got an error in InjectContainerSize");
      }
    });
    displayObserver.observe(ref.current);

    return () => {
      displayObserver.disconnect();
    }

  }, [])

  return (
    <Container ref={ref} buffer={heightBuffer}>
      {
        rect.width > 0 && React.cloneElement(
          React.Children.only(children),
          {
            width: rect.width,
            height: rect.height
          }
        )
      }
    </Container>
  )
}

export default InjectContainerSize;