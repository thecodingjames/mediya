export default { 

  template: `
    <div style="height: 100%; margin-top: -2px;/* hack to fix little scroll */ display: flex; flex-direction: column;">
      <div style="flex-grow: 1; display: flex; flex-direction: column;">
        <router-view></router-view>
      </div>
    </div>
  `

}
