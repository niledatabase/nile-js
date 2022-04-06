# Theme

A string can be provided to prepend the classnames for all dom elements, if the default styles are not to your liking. Additional overriding can be done at the compoenent level.

```typescript
<NileProvider apiUrl="http://localhost:8080" theme="instaExpense">
  <Component {...props} />
</NileProvider>
```

```css
form#signup label.instaExpense-email { 
  padding: 12px 30px;
}

form#signup input.instaExpense-email { 
  border: 20px dotted papayawhip;
}

```