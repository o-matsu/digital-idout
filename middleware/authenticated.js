export default function ({ route, store, redirect }) {
  // 未認証ユーザーはindexへリダイレクト
  if (!store.state.auth.authUser.uid) {
    return redirect('/')
  }
}
