import { createRouter } from "~/lib/create-app";
import list_route from './list'
import add_route from './add'
import notification_route from './notification'
// import get_route from './get'
// import create_route from './create'
// import check_route from './check'
// import post_route from './post'
// import action_route from './action'
// import patch_route from './patch'
// import delete_route from './delete'

const router = createRouter()

router.route('', list_route)
router.route('', add_route)
router.route('', notification_route)
// router.route('', get_route)
// router.route('', create_route)
// router.route('', check_route)
// router.route('', action_route)
// router.route('', post_route)
// router.route('', patch_route)a
// router.route('', delete_route)

export default router