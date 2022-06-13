import React from 'react';

const TabContent = ({name, children}) => {
  return (
    <div id={"tab_for" + name}>
      {children}
    </div>
  )
}

export default TabContent;